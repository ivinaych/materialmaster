sap.ui.define([
    "com/viatris/materialmaster/controller/BaseController",
    "com/viatris/materialmaster/model/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, formatter, MessageToast, JSONModel) {
        "use strict";
        return BaseController.extend("com.viatris.materialmaster.controller.SystemDetails", {
            formatter: formatter,
            gViewName: "SystemDetails",
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.resourceBundle = this.getModelDetails("i18n").getResourceBundle();
                this.oRouter.getRoute("SystemDetails").attachPatternMatched(this._onRouteMatched, this);
                var RequestManagement = this.getModelDetails("RequestManagement");
                var Repository = this.getModelDetails("Repository");

                this.getView().setModel(this.getOwnerComponent().getModel("CreateProject"), "CreateProject");

                //  if (!RequestManagement.getProperty("/fromRequestMangementPage") && !Repository.getProperty("/fromRepositoryPage")) {
                //     this.navigateTo("RequestManagement");
                // }

                if (!(RequestManagement.getProperty("/source") === "requestManagement") && !(RequestManagement.getProperty("/source") === "repository")) {
                    this.navigateTo("RequestManagement");
                }
            },

            _onRouteMatched: function(){
                this.fnRemoveClassificationClassAttributes();

                // this.fnUpdateAltUomData();
            },

            onChangeBasicDataBaseUom: function(oEvent){
                let selectedBaseUKey = oEvent.getParameter("selectedItem").getKey(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    altUomDefaultFieldVals = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/altUomDefaultFieldVals"),
                    ean = MaterialDetails.getProperty("/SystemDetails/basicData1/dimensionsEans/data/MM_EAN_UPC_MARA_EAN11"),
                    eanCat = MaterialDetails.getProperty("/SystemDetails/basicData1/dimensionsEans/data/MM_EAN_CATEGORY_MARA_NUMTP"),
                    grossWt = MaterialDetails.getProperty("/SystemDetails/basicData1/dimensionsEans/data/MM_GROSS_WEIGHT_MARA_BRGEW"),
                    netWt = MaterialDetails.getProperty("/SystemDetails/basicData1/dimensionsEans/data/MM_NET_WEIGHT_MARA_NTGEW"),
                    volume = MaterialDetails.getProperty("/SystemDetails/basicData1/dimensionsEans/data/MM_VOLUME_MARM_VOLUM"),
                    volumeUnit = MaterialDetails.getProperty("/SystemDetails/basicData1/dimensionsEans/data/MM_VOLUME_UNIT_MARM_VOLEH"),
                    weightUnit = MaterialDetails.getProperty("/SystemDetails/basicData1/dimensionsEans/data/MM_WEIGHT_UNIT_MARM_GEWEI"),
                    currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                    prevSelValue = MaterialDetails.getProperty(`/SystemData/BasicData1BaseUom/${currentSystemId}/prevSelectedVal`),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [],
                    CreateProject = this.getModelDetails("CreateProject"),
                    lookupModel = this.getModelDetails("LookupModel"),
                    listOfBaseUoms = lookupModel.getProperty("/MM_UOM_REF_LIST"),
                    materialListId = currentView == "CreateProject" ? CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId") : null,
                    baseUomMappedObj = listOfBaseUoms?.find(item=>{
                        if(item?.MM_KEY == selectedBaseUKey){
                            return item;
                        }
                    }),
                    baseUomVal = baseUomMappedObj?.MM_UOM_REF_LIST_CODE,
                    isBaseUomValExist = false,
                    that = this,
                    newAltUomRow,
                    altUomDefault = {
                        "MM_ALT_UNIT_ISO_MARM_LREMEI_ISO": altUomDefaultFieldVals?.MM_ALT_UNIT_ISO_MARM_LREMEI_ISO?.MM_DEFAULT_VALUE || null,
                        "MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT": altUomDefaultFieldVals?.MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT?.MM_DEFAULT_VALUE || null,
                        "MM_MEASUREMENT_UNIT_TEXT_BUN_MARM_MSEHT": altUomDefaultFieldVals?.MM_MEASUREMENT_UNIT_TEXT_BUN_MARM_MSEHT?.MM_DEFAULT_VALUE || null,
                        "MM_EAN_VARIANT_MARM_GTIN_VARIANT": altUomDefaultFieldVals?.MM_EAN_VARIANT_MARM_GTIN_VARIANT?.MM_DEFAULT_VALUE || null,
                        "MM_AU_MARM_PRFZ": altUomDefaultFieldVals?.MM_AU_MARM_PRFZ?.MM_DEFAULT_VALUE || null,
                        "MM_A_MARM_ZEANS": altUomDefaultFieldVals?.MM_A_MARM_ZEANS?.MM_DEFAULT_VALUE || null,
                        "MM_LENGTH_MARM_LAENG": altUomDefaultFieldVals?.MM_LENGTH_MARM_LAENG?.MM_DEFAULT_VALUE || null,
                        "MM_WIDTH_MARM_BREIT": altUomDefaultFieldVals?.MM_WIDTH_MARM_BREIT?.MM_DEFAULT_VALUE || null,
                        "MM_HEIGHT_MARM_HOEHE": altUomDefaultFieldVals?.MM_HEIGHT_MARM_HOEHE?.MM_DEFAULT_VALUE || null,
                        "MM_UNIT_OF_DIMENSION_MARM_MEABM": altUomDefaultFieldVals?.MM_UNIT_OF_DIMENSION_MARM_MEABM?.MM_DEFAULT_VALUE || null,
                        "MM_NUMBER_MARM_AZSUB": altUomDefaultFieldVals?.MM_NUMBER_MARM_AZSUB?.MM_DEFAULT_VALUE || null,
                        "MM_LUN_MARM_MESUB": altUomDefaultFieldVals?.MM_LUN_MARM_MESUB?.MM_DEFAULT_VALUE || null,
                        "MM_GTIN_MARM_STTPEC_GTIN": altUomDefaultFieldVals?.MM_GTIN_MARM_STTPEC_GTIN?.MM_DEFAULT_VALUE || null,
                        "MM_SER_NUM_MANAG_TYPE_MARM_STTPEC_SERNO_MANAGED": altUomDefaultFieldVals?.MM_SER_NUM_MANAG_TYPE_MARM_STTPEC_SERNO_MANAGED?.MM_DEFAULT_VALUE || null,
                        "MM_BP_TO_PROVIDE_SER_NUMB_MARM_STTPEC_SERNO_PROV_BUP": altUomDefaultFieldVals?.MM_BP_TO_PROVIDE_SER_NUMB_MARM_STTPEC_SERNO_PROV_BUP?.MM_DEFAULT_VALUE || null,
                        "MM_NATIONAL_CODE_MARM_STTPEC_NCODE": altUomDefaultFieldVals?.MM_NATIONAL_CODE_MARM_STTPEC_NCODE?.MM_DEFAULT_VALUE || null,
                        "MM_N_CODE_T_MARM_STTPEC_NCODE_TY": altUomDefaultFieldVals?.MM_N_CODE_T_MARM_STTPEC_NCODE_TY?.MM_DEFAULT_VALUE || null,
                        "MM_REGISTRATION_CODE_MARM_STTPEC_RCODE": altUomDefaultFieldVals?.MM_REGISTRATION_CODE_MARM_STTPEC_RCODE?.MM_DEFAULT_VALUE || null,
                        "MM_SERIALIZATION_INDICATOR_MARM_STTPEC_SERUSE": altUomDefaultFieldVals?.MM_SERIALIZATION_INDICATOR_MARM_STTPEC_SERUSE?.MM_DEFAULT_VALUE || null,
                        "MM_UOM_SYNC_ACTIVE_FLAG_MARM_STTPEC_UOM_SYNC": altUomDefaultFieldVals?.MM_UOM_SYNC_ACTIVE_FLAG_MARM_STTPEC_UOM_SYNC?.MM_DEFAULT_VALUE || null
                    },
                    updatedBasicDataBaseUOMInfoText = this.geti18nText("updatedBasicDataBaseUOMInfoText");
                if(!MaterialDetails.getProperty(`/SystemData/BasicData1BaseUom/${currentSystemId}`)){
                    MaterialDetails.setProperty(`/SystemData/BasicData1BaseUom/${currentSystemId}`, {});
                }
                if(!addUOMList?.length && baseUomVal){
                    let objToUpdate = [{
                        "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS": baseUomVal,
                        "MM_ALTERNATE_UNIT_MARM_MEINH": baseUomVal,
                        "MM_DENOMINATOR_MARM_UMREN": 1,
                        "MM_NUMERATOR_MARM_UMREZ": 1,
                        "MM_EAN_UPC_MARM_EAN11": ean,
                        "MM_CN_MARM_NUMTP": eanCat,
                        "MM_GROSS_WEIGHT_MARM_BRGEW": grossWt,
                        "MM_NET_WEIGHT_MARM_NTGEW": netWt,
                        "MM_VOLUME_MARM_VOLUM": volume,
                        "MM_VOLUME_UNIT_MARM_VOLEH": volumeUnit,
                        "MM_WEIGHT_UNIT_MARM_GEWEI": weightUnit
                    }]
                    objToUpdate = [{
                        ...objToUpdate[0], 
                        ...altUomDefault
                    }];
                    newAltUomRow = this.fnFrameAltUomPayload(objToUpdate, materialListId);
                    MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/UOMData", newAltUomRow);
                }else{
                    addUOMList.map((item) => {
                        item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS = baseUomVal;
                    })
                    // addUOMList.map((item) => {
                    //     if(item.MM_ALTERNATE_UNIT_MARM_MEINH == prevSelValue){
                    //         item.MM_DENOMINATOR_MARM_UMREN = null;
                    //         item.MM_NUMERATOR_MARM_UMREZ = null;
                    //         item.MM_EAN_UPC_MARM_EAN11 = null;
                    //         item.MM_CN_MARM_NUMTP = null;
                    //         item.MM_GROSS_WEIGHT_MARM_BRGEW = null;
                    //         item.MM_NET_WEIGHT_MARM_NTGEW = null;
                    //     }
                    // })
                    let aOldAdditonalData = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalUomDto`);
                    addUOMList.map((item) => {
                        if(item.MM_ALTERNATE_UNIT_MARM_MEINH == baseUomVal){
                            item.MM_DENOMINATOR_MARM_UMREN = 1;
                            item.MM_NUMERATOR_MARM_UMREZ = 1;
                            item.MM_EAN_UPC_MARM_EAN11 = ean;
                            item.MM_CN_MARM_NUMTP = eanCat;
                            item.MM_GROSS_WEIGHT_MARM_BRGEW = grossWt;
                            item.MM_NET_WEIGHT_MARM_NTGEW = netWt;
                            item.MM_VOLUME_MARM_VOLUM = volume;
                            item.MM_VOLUME_UNIT_MARM_VOLEH = volumeUnit;
                            item.MM_WEIGHT_UNIT_MARM_GEWEI = weightUnit;
                            isBaseUomValExist = true;
                        }
                    })
                    if(!isBaseUomValExist){
                        let delAltUnitList = [];
                        aOldAdditonalData?.map(item=>{
                            delAltUnitList.push(item.MM_ALTERNATE_UNIT_MARM_MEINH);
                        })
                        let objToUpdate = [{
                            "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS": baseUomVal,
                            "MM_ALTERNATE_UNIT_MARM_MEINH": baseUomVal,
                            "MM_DENOMINATOR_MARM_UMREN": 1,
                            "MM_NUMERATOR_MARM_UMREZ": 1,
                            "MM_EAN_UPC_MARM_EAN11": ean,
                            "MM_CN_MARM_NUMTP": eanCat,
                            "MM_GROSS_WEIGHT_MARM_BRGEW": grossWt,
                            "MM_NET_WEIGHT_MARM_NTGEW": netWt,
                            "MM_VOLUME_MARM_VOLUM": volume,
                            "MM_VOLUME_UNIT_MARM_VOLEH": volumeUnit,
                            "MM_WEIGHT_UNIT_MARM_GEWEI": weightUnit
                        }]
                        if(delAltUnitList?.length){
                            that.fnDeleteAltUomRow(delAltUnitList, materialListId, currentSystemId);
                        }
                        addUOMList = [];
                        objToUpdate = [{
                            ...objToUpdate[0], 
                            ...altUomDefault
                        }];
                        newAltUomRow = this.fnFrameAltUomPayload(objToUpdate, materialListId);
                        addUOMList.unshift(newAltUomRow[0]);
                    }
                    MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/UOMData", addUOMList);
                }
                MaterialDetails.setProperty(`/SystemData/BasicData1BaseUom/${currentSystemId}/prevSelectedVal`, baseUomVal);
                MessageToast.show(updatedBasicDataBaseUOMInfoText);
                this.onAddingMandatoryValue(oEvent);
            },

            onChangeBasicDataGrossWeight: function(oEvent){
                let grossWt = oEvent.getSource().getValue(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [];
                if(addUOMList?.length){
                    addUOMList.map((item, index) => {
                        if(item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == item.MM_ALTERNATE_UNIT_MARM_MEINH && item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS){
                            item.MM_GROSS_WEIGHT_MARM_BRGEW = grossWt;
                        }
                    })
                }
            },

            onChangeBasicDataNetWeight: function(oEvent){
                let netWt = oEvent.getSource().getValue(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [];
                if(addUOMList?.length){
                    addUOMList.map((item, index) => {
                        if(item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == item.MM_ALTERNATE_UNIT_MARM_MEINH && item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS){
                            item.MM_NET_WEIGHT_MARM_NTGEW = netWt;
                        }
                    })
                }

                this.onAddingMandatoryValue(oEvent);
            },

            onChangeBasicDataEAN: function(oEvent){
                let ean = oEvent.getSource().getValue(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [];
                if(addUOMList?.length){
                    addUOMList.map((item, index) => {
                        if(item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == item.MM_ALTERNATE_UNIT_MARM_MEINH && item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS){
                            item.MM_EAN_UPC_MARM_EAN11 = ean
                        }
                    })
                }
            },

            onChangeBasicDataEANCat: function(oEvent){
                let eanCat = oEvent.getSource().getSelectedKey(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [];
                if(addUOMList?.length){
                    addUOMList.map((item, index) => {
                        if(item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == item.MM_ALTERNATE_UNIT_MARM_MEINH && item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS){
                            item.MM_CN_MARM_NUMTP = eanCat;
                        }
                    })
                }
                this.onAddingMandatoryValue(oEvent);
            },

            onChangeBasicDataVolume: function(oEvent){
                let volume = oEvent?.getSource()?.getValue(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [];
                if(addUOMList?.length){
                    addUOMList.map((item, index) => {
                        if(item?.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS && item?.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == item?.MM_ALTERNATE_UNIT_MARM_MEINH){
                            item.MM_VOLUME_MARM_VOLUM = volume;
                        }
                    })
                }
            },

            onChangeWeightUnit: function(oEvent){
                let MM_WEIGHT_UNIT_MARM_GEWEI = oEvent.getSource().getSelectedKey(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [];
                if(addUOMList?.length){
                    addUOMList.map((item, index) => {
                        if(item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == item.MM_ALTERNATE_UNIT_MARM_MEINH && item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS){
                            item.MM_WEIGHT_UNIT_MARM_GEWEI = MM_WEIGHT_UNIT_MARM_GEWEI;
                        }
                    })
                }
                this.onAddingMandatoryValue(oEvent);
            },

            onChangeVolume: function(oEvent){
                this.onAddingMandatoryValue(oEvent);
            },

            onChangeVolumeUnit: function(oEvent){
                let MM_VOLUME_UNIT_MARM_VOLEH = oEvent.getSource().getSelectedKey(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [];
                if(addUOMList?.length){
                    addUOMList.map((item, index) => {
                        if(item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == item.MM_ALTERNATE_UNIT_MARM_MEINH && item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS){
                            item.MM_VOLUME_UNIT_MARM_VOLEH = MM_VOLUME_UNIT_MARM_VOLEH;
                        }
                    })
                }
                this.onAddingMandatoryValue(oEvent);
            },

            onLiveSearchRefMaterial: function(oEvent){
                this.onAddingMandatoryValue(oEvent);
            },

            // fnUpdateAltUomData: function(selectedBaseUKey, ean, eanCat, MM_GROSS_WEIGHT_MARM_BRGEW, netWt){
            //     let MaterialDetails = this.getModelDetails("MaterialDetails"),
            //         oAppModel = this.getModelDetails("oAppModel"),
            //         currentView = oAppModel.getProperty("/sideNavigation/currentView"),
            //         addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [],
            //         CreateProject = this.getModelDetails("CreateProject"),
            //         lookupModel = this.getModelDetails("LookupModel"),
            //         listOfBaseUoms = lookupModel.getProperty("/MM_UOM_REF_LIST"),
            //         materialListId = currentView == "CreateProject" ? CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId") : null,
            //         baseUomMappedObj = listOfBaseUoms?.find(item=>{
            //             if(item?.MM_KEY == selectedBaseUKey){
            //                 return item;
            //             }
            //         }),
            //         baseUomVal = baseUomMappedObj?.MM_UOM_REF_LIST_CODE,
            //         newAltUomRow;
            //     if(!addUOMList?.length){
            //         let objToUpdate = [{
            //             "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS": baseUomVal,
            //             "MM_ALTERNATE_UNIT_MARM_MEINH": baseUomVal,
            //             "MM_DENOMINATOR_MARM_UMREN": 1,
            //             "MM_NUMERATOR_MARM_UMREZ": 1,
            //             "MM_EAN_UPC_MARM_EAN11": ean,
            //             "MM_CN_MARM_NUMTP": eanCat,
            //             "MM_GROSS_WEIGHT_MARM_BRGEW": grossWt,
            //             "MM_NET_WEIGHT_MARM_NTGEW": netWt
            //         }]
            //         newAltUomRow = this.fnFrameAltUomPayload(objToUpdate, materialListId);
            //         MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/UOMData", newAltUomRow);
            //     }else{
            //         addUOMList.map((item, index) => {
            //             item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS = baseUomVal;
            //             if(index == 0){
            //                 item.MM_ALTERNATE_UNIT_MARM_MEINH = baseUomVal;
            //                 item.MM_DENOMINATOR_MARM_UMREN = 1;
            //                 item.MM_NUMERATOR_MARM_UMREZ = 1;
            //                 item.MM_EAN_UPC_MARM_EAN11 = ean;
            //                 item.MM_CN_MARM_NUMTP = eanCat;
            //                 item.MM_GROSS_WEIGHT_MARM_BRGEW = grossWt;
            //                 item.MM_NET_WEIGHT_MARM_NTGEW = netWt;
            //             }
            //         })
            //     }
            // },

            onGoBackToCreateProject: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                    RequestManagement = this.getModelDetails("RequestManagement"),
                    Repository = this.getModelDetails("Repository"),
                    navigationTo = "CreateProject";
                if (RequestManagement.getProperty("/source") === "repository") navigationTo = "Repository";
                else {
                    CreateProject.setProperty("/MaterialList/fromSystemDetailsView", true)
                    // this.fnSaveSpecificSystemDatainUIModel(currentSystemId);
                }
                this.fnSaveSpecificSystemDatainUIModel(currentSystemId);
                this.confirmPageNavigation(navigationTo);
                MaterialDetails.setProperty("/SystemData/targetSystem", null);
            },

            getViewName: function () {
                return "SystemDetails";
            },

            getRequestSource: function(){
                let oAppModel = this.getModelDetails("oAppModel"),
                    viewName = oAppModel.getProperty("/sideNavigation/currentView");

                if(viewName == "CreateProject"){
                    return "Request_Management";
                }
                else if(viewName == "Repository"){
                    return "Repository";
                }
            },

            fnSaveSpecificSystemDatainUIModel: function (systemId) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    currentSystemDetails = MaterialDetails.getProperty("/SystemDetails");
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemId}`, JSON.parse(JSON.stringify(currentSystemDetails)));
            },

            onChangeSystem: function (oEvent) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                    materialType, repositorySystemStatusId,
                    selectedSystems = MaterialDetails.getProperty(`/SystemData/selectedSystems`),
                    previousSystemId = oEvent.getParameter("previousSelectedItem").getKey(),
                    repository = this.getModelDetails("Repository"),
                    RequestManagement = this.getModelDetails("RequestManagement");

                if (RequestManagement.getProperty("/source") === "requestManagement") {
                    materialType = this.fnGetRequestHeaderData("materialType");
                } else if (RequestManagement.getProperty("/source") === "repository") {
                    materialType = repository.getProperty("/MaterialSelected/materialTypeId");
                }

                selectedSystems?.map(item => {
                    if (item?.MM_SYSTEM_ID == currentSystemId) {
                        MaterialDetails.setProperty("/SystemData/repositorySystemStatusId", item?.repositorySystemStatusId);
                        repositorySystemStatusId = item?.repositorySystemStatusId;
                    }
                })
                this.fnHandleClassListDropdown(currentSystemId);
                this.fnRemoveClassificationClassAttributes();
                this.fnSaveSpecificSystemDatainUIModel(previousSystemId);
                this.fnToLoadSystemDetails(currentSystemId, repositorySystemStatusId);
                this.fnToRenderOdataLookup(currentSystemId);
                this.fnToRenderRulesLookup(materialType, currentSystemId);
            },

            onClickSaveBtn: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems");
                if (selectedSystems.length == 2) {
                    let oview = this.getView(),
                        currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                        otherSystem = selectedSystems.find(system => system.MM_SYSTEM_ID != currentSystemId),
                        copyToSystem = otherSystem ? otherSystem.MM_SYSTEM_ID : null,
                        otherSystemStatus = otherSystem ? otherSystem.requestSystemStatusId : null;
                    if(otherSystemStatus != 13 && otherSystemStatus != 9){
                        this.LoadFragment("CopySystemDetails", oview, true);
                        MaterialDetails.setProperty("/GeneralData/copyToSystem", copyToSystem);
                    }
                    else{
                        this.saveSystemData();
                    }
                }
                else {
                    this.saveSystemData();
                }
            },

            onCloseCopySystemDetails: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails");
                this.getView().byId("id_copySystemDetails").close();
                MaterialDetails.setProperty("/GeneralData/checkBoxSelected", false);
            },

            saveSystemData: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem");
                this.fnSaveSpecificSystemDatainUIModel(currentSystemId);
                this.onSaveasDraftMaterialListFromSystemDetails();
            },

            onSaveasDraftMaterialListFromSystemDetails: async function (oEvent) {
                var frameDtoFor = "Save",
                    that = this;
                await this.fnPostMaterialDetails(frameDtoFor).then(async function (isSuccess) {
                    if (isSuccess) {
                        await that.onGetFilteredDataMatChangeLog("CreateProject", false);
                    }
                });
            },

            onSaveWithoutCopying: function () {
                this.saveSystemData();
                this.onCloseCopySystemDetails();
            },

            onCopyAndSave: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    copyToSystem = MaterialDetails.getProperty("/GeneralData/copyToSystem");
                this.fnSaveSpecificSystemDatainUIModel(copyToSystem);
                this.fnCopyDataValidation(copyToSystem);
                this.saveSystemData();
                this.onCloseCopySystemDetails();
            },

            fnCopyDataValidation: function (copyToSystem) {
                let lookupModel = this.getModelDetails("LookupModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    copiedToSystemData = MaterialDetails.getProperty(`/AggregatedSystemDetails/${copyToSystem}`),
                    basicDataLists = [
                        lookupModel.getProperty("/basicDataList"),
                        lookupModel.getProperty("/basicData2List")
                    ],
                    listOrder = [
                        "basicData1",
                        "basicData2"
                    ];

                for (let element in basicDataLists) {
                    let list = basicDataLists[element],
                        basicData = listOrder[element]
                    for (let field of list) {
                        let currFieldData = copiedToSystemData[basicData][field.subGroup]?.data[field.bindingPath],
                            currFieldLookup = lookupModel.getProperty(`/oDataLookups/${copyToSystem}/${field.bindingPath}`);

                        if (currFieldData && currFieldLookup) {
                            let isPresent = currFieldLookup.some(function (element) {
                                return element[field.path_Code] == currFieldData;
                            });

                            if (!isPresent) {
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${copyToSystem}/${basicData}/${field.subGroup}/data/${field.bindingPath}`, null);
                            }
                        }
                    }
                }
            }

        });
    });