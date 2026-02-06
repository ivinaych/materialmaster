sap.ui.define([
    "com/viatris/materialmaster/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/viatris/materialmaster/model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/Fragment'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageBox, MessageToast, formatter, JSONModel, Fragment) {
        "use strict";
        return BaseController.extend("com.viatris.materialmaster.controller.CreateProject", {
            formatter: formatter,
            gViewName: "CreateProject",

            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.resourceBundle = this.getModelDetails("i18n").getResourceBundle();
                this.oRouter.getRoute("CreateProject").attachPatternMatched(this._onRouteMatched, this);
                var RequestManagement = this.getModelDetails("RequestManagement");
                // if (!RequestManagement.getProperty("/fromRequestMangementPage")) {
                //     this.navigateTo("RequestManagement");
                // }
                if (!(RequestManagement.getProperty("/source") === "requestManagement")) {
                    this.navigateTo("RequestManagement");
                }
            },

            _onRouteMatched: function (oEvent) {
                let requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    oTable = this.byId("createProjectMaterialListId"),
                    createdBy = this.fnGetRequestHeaderData("createdBy"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentUser = oAppModel.getProperty("/userdetails/userMailID"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    fromSystemDetailsView = CreateProject.getProperty("/MaterialList/fromSystemDetailsView"),
                    selectedPath = CreateProject.getProperty("/MaterialList/selectedPath"),
                    selectedIndex = selectedPath ? parseInt(selectedPath.split('/').pop(10)) : 0,
                    isUserRequestOwner = createdBy == currentUser ? true : false;
                CreateProject.setProperty("/GeneralData/isUserRequestOwner", isUserRequestOwner);
                this.onPressIconTabBar();
                this.fnGetRequestChangeRequestLog();
                if (requestNumber) {
                    this.fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId(requestNumber, null, null, "CreateProject", false, true);
                    let materialList = CreateProject.getProperty("/MaterialList/materialList");
                    //On set selection of the new row - internal Calls press Event - onClickMaterialListItem
                    if (materialList?.length) {
                        if (fromSystemDetailsView) {
                            this.byId("createProjectMaterialListId").setSelectedIndex(selectedIndex);
                            this.fnToDisableUiTableSelectedRow(oTable, selectedIndex);
                        }
                        else {
                            this.byId("createProjectMaterialListId").setSelectedIndex(0);
                            this.fnToDisableUiTableSelectedRow(oTable, 0);
                        }
                    }
                }

                MaterialDetails.setProperty("/SystemData/targetSystem", null);
                this.onLoadingBaseUomData();
            },

            getViewName: function () {
                return "CreateProject";
            },

            getRequestSource: function () {
                return "Request_Management";
            },

            onGoBack: function () {
                let navigationTo = "RequestManagement"
                this.confirmPageNavigation(navigationTo)
            },

            onPressIconTabBar: function () {
                let CreateProject = this.getModelDetails("CreateProject"),
                    oTable = this.byId("createProjectMaterialListId"),
                    selectedPath = CreateProject.getProperty("/MaterialList/selectedPath"),
                    selectedIndex = selectedPath ? parseInt(selectedPath.split('/').pop(10)) : 0,
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                    lastApproverTaskName = this.fnGetWfDetailsModelData("lastApproverTaskName"),
                    selectedCreateProjectTab = CreateProject.getProperty("/selectedCreateProjectTab"),
                    actionFooterVisibility = JSON.parse(JSON.stringify(CreateProject.getProperty("/ActionFooterTemplate/visibility"))),
                    s_WF_GMDM = "GMDM_WF_Task",
                    s_WF_GQMD = "GQMD_WF_Task",
                    s_WF_Flex = "Flex_WF_Task",
                    s_WF_Rework = "Requester_Rework_WF_Task";
                switch (selectedCreateProjectTab) {
                    case "materialList":
                        switch (wfTaskType) {
                            case s_WF_Rework:
                                actionFooterVisibility.resubmit = true;
                                actionFooterVisibility.cancel = true;
                                break;
                            case s_WF_GMDM:
                                actionFooterVisibility.reject = true;
                                actionFooterVisibility.returnToRequestor = true;
                                if (requestType == 1) {
                                    actionFooterVisibility.complete = true;
                                }
                                else {
                                    if (lastApproverTaskName == wfTaskType) {
                                        actionFooterVisibility.complete = true;
                                    }
                                    else {
                                        actionFooterVisibility.approve = true;
                                    }
                                }
                                break;
                            case s_WF_GQMD:
                                if (requestType == 2 || requestType == 3 || requestType == 6) {
                                    actionFooterVisibility.reject = true;
                                    actionFooterVisibility.returnToRequestor = true;
                                    actionFooterVisibility.returnToGMDM = true;
                                    if (lastApproverTaskName == wfTaskType) {
                                        actionFooterVisibility.complete = true;
                                    }
                                }
                                break;
                            case s_WF_Flex:
                                actionFooterVisibility.approve = true;
                                actionFooterVisibility.reject = true;
                                actionFooterVisibility.returnToRequestor = true;
                                break;
                        }
                        this.fnToDisableUiTableSelectedRow(oTable, selectedIndex);
                        break;
                    case "requestChangeHistory":
                        var requestChangeLogData = CreateProject.getProperty("/requestChangeHistory/historyDetails");
                        if (!requestChangeLogData.length) {
                            this.fnGetRequestChangeRequestLog();
                        }
                        break;
                }
                CreateProject.setProperty("/ActionFooter/visibility", actionFooterVisibility);
            },
            onMaterialDetailsTabSelection: function (oEvent) {
                var SelectedTabKey = oEvent.getParameter("key"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    MaterialDetails = this.getModelDetails("MaterialDetails");
                CreateProject.setProperty("/MaterialList/selectedMaterialDetailsTab", SelectedTabKey);
                if (SelectedTabKey === "docsComments") {
                    var materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                        docsCommentsFlagCreateProj = MaterialDetails.getProperty("/DocComments/docsCommentsFlagCreateProj");
                    if (materialListId && !docsCommentsFlagCreateProj) {
                        this.fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId(requestNumber, null, materialListId, "CreateProject", true, false);
                    }
                    MaterialDetails.setProperty("/DocComments/docsCommentsFlagCreateProj", true)

                    //case
                    this.fnGetAllCases(requestNumber, CreateProject.getProperty("/MaterialList/selectedMaterialData/materialNumber"), materialListId);

                    //document
                    this.onGetAttachmentByMaterialListId(materialListId, "CreateProject");
                }
            },

            //REQUEST HEADER
            onSelectRequestType: function (oEvent) {
                var reqTypeID = oEvent.getSource().getSelectedKey();
                this.getModelDetails("CreateProject").setProperty("/RequestHeader/data/reqSubType", "");
                this.onAddingMandatoryValue(oEvent);
                this.onLoadRequestSubtype(reqTypeID);
            },

            onSelectRequestSubType: function (oEvent) {
                this.onAddingMandatoryValue(oEvent);
            },

            onSelectMaterialType: function (oEvent) {
                this.onAddingMandatoryValue(oEvent);
            },

            onLiveCheckRequestDesc: function (oEvent) {
                this.onAddingMandatoryValue(oEvent);
            },

            onsaveRequestHeader: function (oEvent, fromEditBtn = false) {
                var that = this,
                    isValid,
                    oAppModel = this.getModelDetails("oAppModel"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    createProject = this.getModelDetails("CreateProject"),
                    lookupData = LookupModel.getData(),
                    requestHeaderData = createProject.getProperty("/RequestHeader/data"),
                    oldRequestHeaderDto = createProject.getProperty("/RequestHeader/oldData"),
                    currenttime = this.onGetCurrentDate("HH:mm:ss"),
                    createdOn,
                    currentUser = oAppModel.getProperty("/userdetails/userMailID"),
                    currentDate = this.onGetCurrentDate("yyyy-mm-dd"),
                    requestSource = this.getRequestSource(),
                    requestPayload = {};
                currentDate = currentDate + " " + currenttime;
                createdOn = requestHeaderData.createdOn + " " + currenttime;
                this.onUpdateNewDocCommentModel("CreateProject");
                var reqHeaderEditability = {
                    "materialType": false,
                    "requestType": false,
                    "reqSubType": false,
                    "requestorOrganization": false
                },
                    inputValidateArray = [
                        {
                            "path": "/RequestHeader/valueState/requestType",
                            "value": requestHeaderData.requestType,
                            "items": lookupData.requestType,
                            "parameter": "MM_KEY",
                            "type": "combobox"
                        },
                        {
                            "path": "/RequestHeader/valueState/requestDescription",
                            "value": requestHeaderData.requestDescription,
                            "type": "input"
                        },
                        {
                            "path": "/RequestHeader/valueState/materialType",
                            "value": requestHeaderData.materialType,
                            "items": lookupData.materialType,
                            "parameter": "MM_KEY",
                            "type": "combobox"
                        },
                        {
                            "path": "/RequestHeader/valueState/reqSubType",
                            "value": requestHeaderData.reqSubType,
                            "items": lookupData.reqSubType,
                            "parameter": "MM_KEY",
                            "type": "combobox"
                        },
                        {
                            "path": "/RequestHeader/valueState/requestorOrganization",
                            "value": requestHeaderData.requestorOrganization,
                            "items": lookupData.requestorOrganization,
                            "parameter": "MM_KEY",
                            "type": "combobox"
                        }
                    ]
                isValid = this.validateInputData("CreateProject", inputValidateArray);

                if (isValid) {
                    if (requestHeaderData) {
                        var updatedRequestHeaderDto = {
                            "changedBy": currentUser, // requestHeaderData.changedBy,
                            "changedOn": currentDate, // requestHeaderData.changedOn, //changedOn
                            "createdBy": requestHeaderData.createdBy, //createdByEmail,
                            "createdOn": requestHeaderData.createdOn,
                            // "dateRequired": requestHeaderData.dateRequired,
                            "requestSubTypeId": parseInt(requestHeaderData.reqSubType),
                            "materialTypeId": parseInt(requestHeaderData.materialType),
                            "requestDescription": this.onTrim(requestHeaderData.requestDescription),
                            "requestStatusId": parseInt(requestHeaderData.requestStatus),
                            // "parentRequestNumber": requestHeaderData.parentRequestNumber,
                            "requestTypeId": parseInt(requestHeaderData.requestType),
                            "requestorOrganization": parseInt(requestHeaderData.requestorOrganization),
                            "scenario": requestHeaderData.scenario,
                            "uiView": requestHeaderData.uiView || null,
                            "priority": requestHeaderData.priority || false,
                            "requestNumber": null,
                            "requestSource": requestSource,
                            "isDeleted": false,
                            "isMassUploadRequest": false
                        };
                        if (requestHeaderData.scenario == 2) { //Update Case
                            updatedRequestHeaderDto.requestNumber = parseInt(requestHeaderData.requestNumber);
                        }
                        requestPayload = {
                            "oldRequestHeaderDto": oldRequestHeaderDto,
                            "updatedRequestHeaderDto": updatedRequestHeaderDto
                        };
                    }
                    that.fnProcessDataRequest("MM_JAVA/createRequestHeader", "POST", null, true, requestPayload,
                        function (responseData) {
                            let result = responseData?.result;
                            if (result) {
                                let requestNo = result.requestNumber,
                                    actions = ["OK"],
                                    successMsg = "Request No - " + requestNo + " " + that.resourceBundle.getText("succesMsgToSaveReqHeaderData");
                                createProject.setProperty("/RequestHeader/data/requestNumber", requestNo);
                                createProject.setProperty("/RequestHeader/data/changedBy", currentUser);
                                createProject.setProperty("/RequestHeader/data/changedOn", currentDate);
                                createProject.setProperty("/RequestHeader/editable", reqHeaderEditability);
                                createProject.setProperty("/RequestHeader/data/scenario", 2);//Making scenario to 2 as soon as confirm header is pressed .. (To avoid multiple updates on request number)
                                createProject.setProperty("/RequestHeader/oldData", JSON.parse(JSON.stringify(updatedRequestHeaderDto))); //Update the Old Value to Latest data posted in DB
                                createProject.setProperty("/RequestHeader/savedData", JSON.parse(JSON.stringify(requestHeaderData))); //Update the Old Value to Latest data posted in DB for dirty flag
                                if (!fromEditBtn) {
                                    that.showMessage(successMsg, "S", actions, "OK", function (action) {
                                        createProject.setProperty("/selectedCreateProjectTab", "materialList"); //navigation to MaterialList after saving the requestheader
                                    });
                                }
                            }
                            that.fnGetRequestChangeRequestLog();
                            that.closeBusyDialog();
                        },
                        function (responseData) {
                            let errorMsg = that.resourceBundle.getText("errorMsgToSaveData") + "Request Header Data",
                                actions = ["OK"];
                            that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                            });
                            that.closeBusyDialog();
                        })
                }
                else {
                    let errorMsg = that.resourceBundle.getText("errorMessageMandatory"),
                        actions = ["OK"];
                    that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                    });
                }
            },

            //MATERIAL lIST
            onAddMaterialList: function () {
                var CreateProject = this.getModelDetails("CreateProject"),
                    requestType = this.fnGetRequestHeaderData("requestType");
                if (requestType == 2 || requestType == 3) {
                    CreateProject.setProperty("/MaterialList/existingMaterial", {
                        "materialNo": null,
                        "MaterialSearchHelpSet": [],
                        "checkBoxSelected": false,
                        "withReferenceFlag": false
                    });
                    CreateProject.setProperty("/MaterialList/editable/materialSearchOkBtnEditable", false)   //To set ok button disable dialog is opened
                    this.onAddExistingMaterial();
                }
                else {
                    this.onAddReferenceMaterial();
                }
            },

            onAddExistingMaterial: function () {
                let oview = this.getView();
                this.LoadFragment("AddExistingMaterial", oview, true);
            },

            onOkAddExistingMaterial: function () {
                this.getView().byId("id_addExistingMaterial").close();
                this.onPushNewMaterial();
            },

            onCloseAddExistingMaterial: function () {
                this.getView().byId("id_addExistingMaterial").close();
            },

            onAddReferenceMaterial: function () {
                let oview = this.getView(),
                    CreateProject = this.getModelDetails("CreateProject");
                CreateProject.setProperty("/MaterialList/existingMaterial/materialNo", null);
                this.LoadFragment("CopyExistingMaterial", oview, true);
            },

            onProceedExistingMaterial: function () {
                this.getView().byId("id_copyExistingMaterial").close();
                this.onPushNewMaterial();
            },

            onCopyExistingMaterial: function () {
                let CreateProject = this.getModelDetails("CreateProject");
                this.onCloseCopyExistingMaterial();
                CreateProject.setProperty("/MaterialList/existingMaterial/withReferenceFlag", true);
                this.onPushNewMaterial();
            },

            onCloseCopyExistingMaterial: function () {
                let CreateProject = this.getModelDetails("CreateProject");
                this.getView().byId("id_copyExistingMaterial").close();
                CreateProject.setProperty("/MaterialList/existingMaterial/checkBoxSelected", false);
            },

            addMaterialSuggestionItemSelected: function () {          //To set ok button enable when an item is selected
                let CreateProject = this.getModelDetails("CreateProject");
                CreateProject.setProperty("/MaterialList/editable/materialSearchOkBtnEditable", true);
            },

            onPushNewMaterial: function () {
                var CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    materialListData = JSON.parse(JSON.stringify(CreateProject.getProperty("/MaterialList/materialList"))) || [],
                    materialType = this.fnGetRequestHeaderData("materialType"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    length = materialListData.length,
                    line = JSON.stringify((length + 1) * 10),
                    that = this,
                    TableData = {
                        "included": true,
                        "line": line,
                        "materialTypeId": materialType,
                        "materialNumber": null,
                        "materialDescription": null,
                        "materialStatus": null,
                        "validated": false,
                        "markedAsDeleted": false,
                        "materialListId": null,
                        "esignDone": false,
                        "visibility": {
                            "include": true,
                            "validate": true,
                            "save": true,
                            "commitToRepo": false,
                            "syndicate": false,
                            "delete": true
                        },
                        "enability": {
                            "include": false,
                            "validate": true,
                            "save": true,
                            "commitToRepo": true,
                            "syndicate": true,
                            "delete": true
                        }
                    };
                if (requestType == 2 || requestType == 3) {
                    let existingMaterial = CreateProject.getProperty("/MaterialList/existingMaterial/materialNo");
                    if (materialListData.some(item => item.materialNumber == existingMaterial)) {
                        var firstPartMsg = that.geti18nText("materialNo"),
                            secondPartMsg = that.geti18nText("alreadyExistsInMaterialList"),
                            msg = firstPartMsg + " " + existingMaterial + " " + secondPartMsg,
                            actions = ["OK"];
                        that.showMessage(msg, "W", actions, "OK", function (action) {
                            if (action === "OK") {
                            }
                        });
                        return;
                    }
                    else {
                        TableData.materialNumber = existingMaterial;
                    };
                }
                materialListData.push(TableData);
                MaterialDetails.setProperty("/Classification/classificationItemEditable", true);
                CreateProject.setProperty("/MaterialList/materialList", materialListData);
                CreateProject.setProperty("/MaterialList/visible/MaterialDetails", true);
                //On set selection of the new row - internal Calls press Event - onClickMaterialListItem
                this.byId("createProjectMaterialListId").setSelectedIndex(length); //length ->coz new length is (length+1)
                this.fnEnableAddBtn_ML(materialListData);
            },

            // fnValidateMaterialData: async function () {
            //     Moved to Base Controller
            //     });
            // },

            // onSaveMaterialList: function (oEvent) {
            //     Moved to Base Controller
            // },

            // fnToTriggerSaveMaterialList: function (oEvent) {
            //     Moved to Base Controller
            // },

            fnCheckDuplicateMaterial: async function () {
                return new Promise(resolve => {

                    var oAppModel = this.getModelDetails("oAppModel"),
                        wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType");

                    if (wfTaskType != "Requester_Rework_WF_Task" &&
                        wfTaskType != "Request_Form_Submission" &&
                        wfTaskType != "GMDM_WF_Task"
                    ) {
                        resolve(false);
                    }

                    //code for dupliacate material check
                    var that = this;
                    var CreateProject = this.getModelDetails("CreateProject"),
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        livery = this.onGetProductDataValue("1020")?.sValue,
                        globalMaterialDescription = this.onGetProductDataValue("1016")?.sValue,
                        tradeName = this.onGetProductDataValue("1051")?.sValue,
                        requestedMaterialDescription = this.onGetProductDataValue("1038")?.sValue;

                    var requestType = CreateProject.getProperty("/RequestHeader/data/requestType");

                    if (requestType != 1) {
                        resolve(false);
                    }
                    var alternateIdDto = [];
                    var mAlternateIdDto = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedIDs");

                    mAlternateIdDto?.map(function (item) {
                        var lineAlternateId = {
                            "MM_ALTERNATE_ID_TYPE": item.Alternate_ID_Type,
                            "MM_ALTERNATE_ID_TYPE_COUNTRY": item.Alternate_ID_Type_Country ? item.Alternate_ID_Type_Country : null,
                            "MM_ALTERNATE_ID_FIELD_VALUE": item.Field_Value,
                            "MM_ALTERNATE_ID_REPOSITORY_ROW_ID": null,
                            "MM_ALTERNATE_ID_REQUEST_ROW_ID": null,
                            "isDeleted": false,
                            "materialListId": null,
                        }

                        alternateIdDto.push(lineAlternateId);
                    })

                    var payload = {
                        "globalMaterialDescription": globalMaterialDescription ? globalMaterialDescription : null,
                        "livery": livery ? livery : null,
                        "productDataStaticDto": {
                            "alternateIdDto": alternateIdDto
                        },
                        "tradeName": tradeName ? tradeName : null,
                        "requestedMaterialDescription": requestedMaterialDescription ? requestedMaterialDescription : null
                    }

                    var DuplicateMaterial = new JSONModel();
                    this.getView().setModel(DuplicateMaterial, "DuplicateMaterial");

                    this.fnProcessDataRequest("MM_JAVA/duplicateMaterialCheck", "POST", null, true, payload,
                        function (responseData) {

                            if (responseData.response.length > 0) {
                                var listOfDuplicateMaterials = responseData.response;
                                that.fnFlattenDuplicateData(listOfDuplicateMaterials);

                                that.closeBusyDialog();
                                resolve(true);

                            } else {
                                that.closeBusyDialog();
                                resolve(false);
                            }


                        },
                        function (error) { }
                    );



                })
            },

            fnFlattenDuplicateData: function (listOfDuplicateMaterials) {
                let listOfDuplicateData = [];
                let DuplicateMaterial = this.getView().getModel("DuplicateMaterial");

                listOfDuplicateMaterials.map(function (item) {
                    let alternateDto = item.alternateIdDtos;
                    // alternateDto.map(function (altDto) {
                    let altDto = item.alternateIdDtos;
                    let lineDuplicateItem = {
                        "materialNumber": item.materialNumber,
                        "livery": item.livery,
                        "tradeName": item.tradeName,
                        "requestedMaterialDescription": item.requestedMaterialDescription,
                        "globalMaterialDescription": item.globalMaterialDescription,
                        "isDeleted": altDto.isDeleted,
                        "repository_Row_ID": altDto.mm_ALTERNATE_ID_REPOSITORY_ROW_ID,
                        "field_Value": altDto.mm_ALTERNATE_ID_FIELD_VALUE,
                        "alternate_ID_Type_Country": altDto.mm_ALTERNATE_ID_TYPE_COUNTRY,
                        "alternate_ID_Type": altDto.mm_ALTERNATE_ID_TYPE

                    }
                    listOfDuplicateData.push(lineDuplicateItem);
                    // })

                })

                DuplicateMaterial.setProperty("/DuplicateCheckData", listOfDuplicateData);
            },

            onCloseDuplicateCheck: function (oEvent) {
                this.byId("id_DuplicateCheck").close();
            },

            onProceedDuplicateCheck: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails");
                if (MaterialDetails.getProperty("/GeneralData/materialData/pressedCommitToRepo")) {
                    MaterialDetails.setProperty("/GeneralData/materialData/pressedCommitToRepo", null);
                    let actionID = "commit_To_Repo";
                    this.onOpenCommentsPopScreen(actionID, false);
                } else {
                    this.fnPostMaterialDetails("Validate", true);
                }

                this.onCloseDuplicateCheck();
            },

            onRemoveMaterialList: function (oEvent) {
                var createProjectModel = this.getModelDetails("CreateProject"),
                    MaterialListData = JSON.parse(JSON.stringify(createProjectModel.getProperty("/MaterialList/materialList"))),
                    bindingPath = oEvent.getSource().getBindingContext("CreateProject").sPath,
                    materialListId, matListData, requestNumber;
                matListData = createProjectModel.getProperty(bindingPath);
                requestNumber = matListData.requestNumber;
                materialListId = matListData.materialListId;
                if (!materialListId) {
                    bindingPath = bindingPath.replaceAll("/MaterialList/materialList/", "")
                    MaterialListData.splice(bindingPath, 1);
                    for (var i = 0; i < MaterialListData.length; i++) {
                        MaterialListData[i].line = JSON.stringify((i + 1) * 10);
                    }
                    createProjectModel.setProperty("/MaterialList/materialList", MaterialListData);
                    if (MaterialListData?.length > 0) {
                        this.byId("createProjectMaterialListId").setSelectedIndex(0);
                    }
                    else {
                        createProjectModel.setProperty("/MaterialList/visible/MaterialDetails", false);
                    }
                    this.fnEnableAddBtn_ML(MaterialListData);
                }
                else {
                    var url = `MM_JAVA/deleteMaterialList?materialListId=${materialListId}`,
                        actions = ["NO", "YES"],
                        that = this,
                        confirmationMsg = this.resourceBundle.getText("deleteConfirmation");

                    this.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            that.fnProcessDataRequest(url, "DELETE", null, true, null,
                                async function (responseData) {
                                    await that.ongetAllMaterialList(requestNumber);
                                    let MaterialListDataAfterDelete = createProjectModel.getProperty("/MaterialList/materialList");//New materialList
                                    if (MaterialListDataAfterDelete?.length > 0) {
                                        that.byId("createProjectMaterialListId").setSelectedIndex(0);
                                    }
                                    else {
                                        createProjectModel.setProperty("/MaterialList/visible/MaterialDetails", false);
                                    }
                                    that.closeBusyDialog();
                                },
                                function (responseData) {
                                    that.closeBusyDialog();
                                })
                        }
                    });
                }
            },

            onGetAllFieldNamesProductData: function () {
                return new Promise(async (resolve) => {
                    let that = this,
                        CreateProject = this.getModelDetails("CreateProject"),
                        LookupModel = this.getModelDetails("LookupModel"),
                        materialType = this.fnGetRequestHeaderData("materialType"),
                        sUrl = "MM_JAVA/getAttributesList",
                        oPayload = {
                            "materialTypeId": materialType,
                            "uiView": "Product_Data",
                            "requestSource": "Request_Management"
                        };
                    this.fnProcessDataRequest(sUrl, "POST", null, true, oPayload,
                        function (responseData) {
                            CreateProject.setProperty("/MaterialList/generalDetails/attributeListProdData", responseData?.attributeList);
                            LookupModel.setProperty("/attributeListProdData", responseData?.attributeList);
                            that.closeBusyDialog();
                            resolve(true);
                        },
                        function (error) {
                            that.closeBusyDialog();
                            resolve(false);
                        }
                    );
                });
            },

            onClickMaterialListitem: async function (oEvent) {
                var CreateProject = this.getModelDetails("CreateProject"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedPath = oEvent.getParameter("rowContext")?.sPath,
                    productDataOutline = CreateProject.getProperty("/productDataOutline"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    materialType = this.fnGetRequestHeaderData("materialType"),
                    requestStatus = this.fnGetRequestHeaderData("requestStatus"),
                    tabNamePostEditClick = this.fnGetRequestHeaderData("uiView"),
                    selectedMaterialDetailsTab = CreateProject.getProperty("/MaterialList/selectedMaterialDetailsTab"),
                    materialListId = CreateProject.getProperty(selectedPath)?.materialListId,
                    materialNumber = CreateProject.getProperty(selectedPath)?.materialNumber || null,
                    selectedData = CreateProject.getProperty(selectedPath),
                    withReferenceFlag = CreateProject.getProperty("/MaterialList/existingMaterial/withReferenceFlag"),
                    promiseArray = [],
                    attributeListProdData = CreateProject.getProperty("/MaterialList/generalDetails/attributeListProdData"),
                    that = this;
                if (!selectedPath) { return; }

                let oTable = this.byId("createProjectMaterialListId"),
                    selectedRowIndex = parseInt(selectedPath?.split('/')?.pop(10));

                CreateProject.setProperty("/MaterialList/selectedPath", selectedPath);
                CreateProject.setProperty("/MaterialList/selectedMaterialData", selectedData);
                this.openBusyDialog();
                if (!attributeListProdData) {
                    await that.onGetAllFieldNamesProductData();// For getting a alternate label name if label is numeric code..
                }
                //No Outline exist or if it is an empty json
                if (!productDataOutline || Object.keys(productDataOutline)?.length === 0) {
                    await this.onReloadMaterialDetailJSON(that.gViewName).then(async function () {
                        await that.fnToLoadProductDataOutline(that.gViewName).then(async function () {
                            if (materialListId) {
                                let p1 = that.getDatabyMaterialListId(materialListId);
                                let p2 = await that.fnSetSystemProperties(materialListId, materialNumber, that.gViewName);
                                promiseArray.push([p1, p2]);
                            }
                        });
                    });
                }
                else {
                    await this.onReloadMaterialDetailJSON(that.gViewName).then(async function () {
                        if (materialListId) {
                            let p1 = that.getDatabyMaterialListId(materialListId);
                            let p2 = await that.fnSetSystemProperties(materialListId, materialNumber, that.gViewName);
                            promiseArray.push([p1, p2]);
                        } else {
                            // that.fnRemoveClassificationClassAttributes();
                        }
                    })
                }
                if (!materialListId) {
                    let materialNumber = CreateProject.getProperty("/MaterialList/existingMaterial/materialNo");
                    this.onSetDefaultValueforProductData();
                    await this.fnSetSystemProperties(null, materialNumber, that.gViewName);
                    //Call the SAP service for edit and extend material scenario
                    if (requestType != "1" || withReferenceFlag) {
                        // let materialNumber = CreateProject.getProperty("/MaterialList/existingMaterial/materialNo");
                        MaterialDetails.setProperty("/GeneralData/refMaterialNumber", materialNumber);
                        await this.fnGetRepositoryDataOnMaterialNumberJAVA(materialNumber);
                        await this.fnLoadSAPDataMaterialNo(materialNumber);
                        let systemData = MaterialDetails.getProperty("/SystemData/selectedSystems");
                        if (systemData) {
                            systemData.map(item => {
                                that.fnToRenderOdataLookup(item?.MM_SYSTEM_ID);
                                that.fnToRenderRulesLookup(materialType, item?.MM_SYSTEM_ID);
                                if (item.repositorySystemStatusId == "10" || item.repositorySystemStatusId == "11") {
                                    this.handleBasicDataProperties(item.MM_SYSTEM_ID, item.repositorySystemStatusId, true);
                                }
                                // that.fnUpdateAltUomDataMaterialAdd(item?.systemId);
                            })
                        }
                    }
                }

                if (selectedMaterialDetailsTab == "docsComments" && materialListId) {
                    this.fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId(requestNumber, null, materialListId, "CreateProject", true, false);
                    MaterialDetails.setProperty("/DocComments/docsCommentsFlagCreateProj", true);

                    //case
                    this.fnGetAllCases(requestNumber, CreateProject.getProperty(selectedPath).materialNumber, materialListId);

                    //documents
                    this.onGetAttachmentByMaterialListId(materialListId, "CreateProject");
                }

                let p3 = this.handleEditabilityforProductData(that.gViewName, materialListId);
                promiseArray.push(p3);
                Promise.all(promiseArray).then(() => {
                    that.handleEditabilityforOrgData("CreateProject");
                    that.onGetFilteredDataMatChangeLog("CreateProject", false);

                    // // copy existing basic data values to alt uom table
                    let systemData = MaterialDetails.getProperty("/SystemData/selectedSystems");
                    if (systemData && requestType == "1") {
                        systemData?.map(item => {
                            that.fnUpdateAltUomDataMaterialAdd(item?.MM_SYSTEM_ID);
                            if (item?.repoSystemStatusIdTemp == "10" || item?.repoSystemStatusIdTemp == "11") {
                                that.handleBasicDataProperties(item?.MM_SYSTEM_ID, item?.repositorySystemStatusId, true);
                            }
                            else {
                                that.handleBasicDataProperties(item?.MM_SYSTEM_ID, item?.repositorySystemStatusId, false);
                            }
                        })
                    }
                    // // End
                    that.fnToDisableUiTableSelectedRow(oTable, selectedRowIndex);
                    that.closeBusyDialog();
                }).catch(error => {
                    console.log("An Error Occured!")
                });
            },

            onSetDefaultValueforProductData: function () {
                let CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    productDataOutline = CreateProject.getProperty("/productDataOutline");
                for (let classPath in productDataOutline) {
                    let defaultValue = JSON.parse(JSON.stringify(MaterialDetails.getProperty(`/ProductData/${classPath}/MM_DEFAULT_VALUE`)));
                    MaterialDetails.setProperty(`/ProductData/${classPath}/data`, defaultValue);
                }
            },

            fnToExcludeMaterial: function (oEvent) {
                let selected = oEvent.getParameters().selected,
                    bindingPath = oEvent.getSource().getBindingContext("CreateProject").sPath,
                    CreateProject = this.getModelDetails("CreateProject"),
                    materialListId, matListData, requestNumber,
                    that = this;
                CreateProject.setProperty("/GeneralData/bindingPathForExcludedMaterial", bindingPath);

                this.openBusyDialog();
                matListData = CreateProject.getProperty(bindingPath);
                requestNumber = matListData.requestNumber;
                materialListId = matListData.materialListId;
                if (materialListId && !selected) {
                    let actions = ["NO", "YES"],
                        confirmationMsg = this.resourceBundle.getText("excludeMaterialConfirmation");
                    CreateProject.setProperty(bindingPath + "/included", true);
                    that.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            let actionID = "exclude_material";
                            that.onOpenCommentsPopScreen(actionID, false);
                        }
                        else {
                            // Don't update the included flag - if user press NO button on confirmation
                            CreateProject.setProperty(bindingPath + "/included", true);
                            that.closeBusyDialog();
                        }
                    });
                } else {
                    this.closeBusyDialog();
                }
            },

            fnToExcludeMaterialAfterCommentSubmission: function (that) {
                let CreateProject = that.getModelDetails("CreateProject"),
                    materialListId, matListData, requestNumber, url, payload,
                    bindingPath = CreateProject.getProperty("/GeneralData/bindingPathForExcludedMaterial");
                matListData = CreateProject.getProperty(bindingPath);
                requestNumber = matListData.requestNumber;
                materialListId = matListData.materialListId;
                url = "MM_JAVA/updateIncludeFlag";
                payload = {
                    "materialListId": materialListId,
                    "requestNumber": requestNumber
                };

                that.fnProcessDataRequest(url, "POST", null, true, payload,
                    async function () {
                        let excludeSuccess = that.resourceBundle.getText("excludeSuccess");
                        that.showMessage(excludeSuccess, "S", ["OK"], "Ok", function (action) {
                        });
                        CreateProject.setProperty(bindingPath + "/included", false);
                        await that.ongetAllMaterialList(requestNumber);
                        that.closeBusyDialog();
                    },
                    function (responseData) {
                        let excludeError = that.resourceBundle.getText("excludeError");
                        that.showMessage(excludeError, "E", ["OK"], "Ok", function (action) {
                        });
                        that.closeBusyDialog();
                    })
            },

            //Org and System Data
            fnToExcludeOrgData: function (oEvent) {
                let selected = oEvent.getParameters().selected,
                    bindingPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    oAppModel = this.getModelDetails("oAppModel"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    id_MS_Excluded = 6,
                    id_MS_Draft = 1,
                    s_WF_Requestor = "Request_Form_Submission",
                    that = this;
                MaterialDetails.setProperty("/GeneralData/bindingPathForExcludedPlant", bindingPath);
                this.openBusyDialog();
                if (!selected) {
                    let actions = ["NO", "YES"],
                        confirmationMsg = this.resourceBundle.getText("excludePlantConfirmation");
                    that.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            let actionID = "exclude_plant";
                            if (materialListId) {
                                that.onOpenCommentsPopScreen(actionID, false);
                            }
                            else {
                                MaterialDetails.setProperty(bindingPath + "/requestPlantStatus", id_MS_Excluded);
                                that.closeBusyDialog();
                            }
                        }
                        else {
                            // Don't update the included flag - if user press NO button on confirmation
                            MaterialDetails.setProperty(bindingPath + "/isIncluded", true);
                            that.closeBusyDialog();
                        }
                    });
                }
                else if (selected && wfTaskType == s_WF_Requestor) {
                    let actions = ["NO", "YES"],
                        confirmationMsg = this.resourceBundle.getText("includePlantConfirmation");
                    that.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            let actionID = "include_plant";
                            if (materialListId) {
                                that.onOpenCommentsPopScreen(actionID, false);
                            }
                            else {
                                MaterialDetails.setProperty(bindingPath + "/requestPlantStatus", id_MS_Draft);
                                that.closeBusyDialog();
                            }
                        }
                        else {
                            // Don't update the included flag - if user press NO button on confirmation
                            MaterialDetails.setProperty(bindingPath + "/isIncluded", false);
                            that.closeBusyDialog();
                        }
                    });
                }
                else {
                    that.closeBusyDialog();
                }
            },

            onPressExcludeSystem: function (oEvent) {
                let selected = oEvent.getParameters().selected,
                    bindingPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    id_MS_Excluded = 6, that = this;
                MaterialDetails.setProperty("/GeneralData/bindingPathForExcludedSystem", bindingPath);
                this.openBusyDialog();
                if (!selected) {
                    let actions = ["NO", "YES"],
                        confirmationMsg = this.resourceBundle.getText("excludeSystemConfirmation");
                    that.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            let actionID = "exclude_system";
                            MaterialDetails.setProperty(bindingPath + "/markForSyndication", false);
                            if (materialListId) {
                                that.onOpenCommentsPopScreen(actionID, false);
                            }
                            else {
                                MaterialDetails.setProperty(bindingPath + "/requestPlantStatus", id_MS_Excluded);
                                that.closeBusyDialog();
                            }
                        }
                        else {
                            // Don't update the included flag - if user press NO button on confirmation
                            MaterialDetails.setProperty(bindingPath + "/isIncluded", true);
                            that.closeBusyDialog();
                        }
                    });
                } else {
                    this.closeBusyDialog();
                }
            },

            fnToExcludeSystemData: function () {
                var that = this,
                    CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    materialNumber = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialNumber"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    selectedPath = MaterialDetails.getProperty("/GeneralData/bindingPathForExcludedSystem"),
                    selectedIndex = parseInt(selectedPath.split('/').pop(10)),
                    systemId = selectedSystems[selectedIndex].MM_SYSTEM_ID,
                    requestPayload = {
                        "materialListId": materialListId || null,
                        "materialNumber": materialNumber || null,
                        "systemId": systemId
                    },
                    url = `MM_JAVA/updateIncludeFlagForSystemData`;
                that.fnProcessDataRequest(url, "POST", null, true, requestPayload,
                    function (responseData) {
                        if (responseData?.statusCode === "200") {
                            MaterialDetails.setProperty(`${selectedPath}/requestSystemStatusId`, 6); //Exclusion Status
                        }
                        that.closeBusyDialog();
                    },
                    function (responseData) { })
            },

            fnToExcludeorIncludePlantData: function () {
                var that = this,
                    CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    materialNumber = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialNumber"),
                    selectedPath = MaterialDetails.getProperty("/GeneralData/bindingPathForExcludedPlant"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    isSelected = MaterialDetails.getProperty(`${selectedPath}/isIncluded`),
                    plantId = MaterialDetails.getProperty(`${selectedPath}/MM_PLANT_ID`),
                    requestPayload = {
                        "materialListId": materialListId || null,
                        "materialNumber": materialNumber || null,
                        "plantId": plantId || null,
                        "requestNumber": requestNumber
                    },
                    url;
                if (isSelected) {
                    url = `MM_JAVA/updateIncludeFlagAndRequestPlantStatusForOrgData`;
                } else {
                    url = `MM_JAVA/updateIncludeFlagForOrgData`;
                }
                that.fnProcessDataRequest(url, "POST", null, true, requestPayload,
                    function (responseData) {
                        if (responseData?.statusCode === "200") {
                            if (isSelected) {
                                MaterialDetails.setProperty(`${selectedPath}/requestPlantStatus`, 1); //Draft Status
                            } else {
                                MaterialDetails.setProperty(`${selectedPath}/requestPlantStatus`, 6); //Exclusion Status
                            }
                        }
                        that.closeBusyDialog();
                    },
                    function (responseData) { })
            },

            onClickViewBasicData: function (oEvent) {
                let systemId = oEvent.getSource().getBindingContext("MaterialDetails").getObject().MM_SYSTEM_ID,
                    repositorySystemStatusId = oEvent.getSource().getBindingContext("MaterialDetails").getObject().repositorySystemStatusId,
                    materialType = this.fnGetRequestHeaderData("materialType"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedSystems = MaterialDetails.getProperty(`/SystemData/selectedSystems`);
                selectedSystems?.map(item => {
                    if (item?.MM_SYSTEM_ID == systemId) {
                        MaterialDetails.setProperty("/SystemData/repositorySystemStatusId", item?.repositorySystemStatusId);
                    }
                });
                this.fnHandleClassListDropdown(systemId);
                this.handleSystemDropdown(systemId);
                this.fnToRenderOdataLookup(systemId);
                this.fnToRenderRulesLookup(materialType, systemId);
                this.oRouter.navTo("SystemDetails", { targetSystem: systemId });
                this.fnToLoadSystemDetails(systemId, repositorySystemStatusId);
                this.fnUpdateAltUomDataMaterialAdd(systemId);
            },

            onPressCommitToRepo: function () {
                //first we will do duplicate check at gmdm level for create flow
                var that = this;
                var MaterialDetails = this.getModelDetails("MaterialDetails");
                var oView = this.getView();
                this.fnCheckDuplicateMaterial().then((isDuplicateMaterialsFound) => {
                    if (isDuplicateMaterialsFound) {
                        MaterialDetails.setProperty("/GeneralData/materialData/pressedCommitToRepo", true);
                        //show duplicate material dialog
                        that.LoadFragment("DuplicateMaterial", oView);
                    } else {
                        let actionID = "commit_To_Repo";
                        this.onOpenCommentsPopScreen(actionID, false);
                    }
                })
            },
            fnToCommitToRepo: function(){
                this.debouncedButtonTimer(this._executeToCommitToRepo, "commitToRepoBtn")
            },
            _executeToCommitToRepo: function () {
                let that = this,
                    CreateProject = this.getModelDetails("CreateProject"),
                    selectedData = CreateProject.getProperty("/MaterialList/selectedMaterialData"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    commitToRepoPayload = {},
                    currentDate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                    currentUser = this.fnGetCurrentUserMailID(),
                    dataChangeIndicatorDto = {
                        "additionalDataBasicDataTextChangeFlag": true,
                        "additionalDataDescChangeFlag": true,
                        "additionalUomDataChangeFlag": true,
                        "basicData1changeFlag": true,
                        "basicData2changeFlag": true,
                        "classificationDataChangeFlag": true,
                        "isSyndicated": false,
                        "materialNoGenerationReq": selectedData?.materialNumber ? false : true,
                        "organisationDataFlag": true,
                        "productDataChangeFlag": true
                    };
                commitToRepoPayload = {
                    "dataChangeIndicatorDto": dataChangeIndicatorDto,
                    "materialListId": selectedData?.materialListId || null,
                    "materialNumber": selectedData?.materialNumber || null,
                    "materialTypeId": selectedData?.materialTypeId || null,
                    "requestNumber": requestNumber,
                    "requestTypeId": requestType,
                    "createdOn": currentDate,
                    "createdBy": currentUser,
                    "changedOn": currentDate,
                    "changedBy": currentUser
                };
                this.fnProcessDataRequest("MM_JAVA/updateRepoDetails", "POST", null, true, commitToRepoPayload,
                    function (responseData) {
                        let displayMsg,
                            actions = ["OK"];
                        if (responseData?.statusCode == 200) {
                            displayMsg = that.geti18nText("successCommitToRepo");
                            that.showMessage(displayMsg, "S", actions, "OK", function (action) {
                            });
                            that.ongetAllMaterialList(requestNumber);
                            that.onGetAttachmentByMaterialListId(selectedData?.materialListId, "CreateProject");

                        }
                        else {
                            displayMsg = that.geti18nText("ErrorCommitToRepo");
                            that.showMessage(displayMsg, "E", actions, "OK", function (action) {
                            });
                            that.closeBusyDialog();
                        }
                    },
                    function (errorResp) {
                        let displayMsg = that.geti18nText("ErrorCommitToRepo"),
                            actions = ["OK"];
                        that.showMessage(displayMsg, "E", actions, "OK", function (action) {
                        });
                        that.closeBusyDialog();
                    }
                );
            },

            onSyndicateBtn: function () {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    systemSyndication = selectedSystems.map(system => ({
                        toBeSyndicated: system?.markForSyndication ? "Selected for Syndication" : "Not Selected for Syndication",
                        systemId: system.MM_SYSTEM_ID
                    }));
                MaterialDetails.setProperty("/GeneralData/systemsForSyndication", systemSyndication);
                this.LoadFragment("SyndicateSystems", oView, true);
            },

            onCloseSystemsForSync: function () {
                this.getView().byId("id_SystemsForSyndication").close();
            },

            onOkSystemsForSyndication: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    systemSyndication = MaterialDetails.getProperty("/GeneralData/systemsForSyndication"),
                    hasAvailableForSyndication = systemSyndication.some(item => item.toBeSyndicated === "Selected for Syndication"),
                    actionID = "syndicate_Material",
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    that = this;
                that.openBusyDialog();
                if (requestType == 6) {
                    that.fnStepsToSyndicate(!(hasAvailableForSyndication || false));
                    this.getView().byId("id_SystemsForSyndication").close();
                }
                else {
                    if (hasAvailableForSyndication) {
                        this.getView().byId("id_SystemsForSyndication").close();
                        that.onOpenCommentsPopScreen(actionID, false);
                    }
                    else {
                        that.closeBusyDialog();
                        this.getView().byId("id_SystemsForSyndication").close();
                    }
                }
            },
            fnStepsToSyndicate: function(isDirectTaskCompletion= false){
                this.debouncedButtonTimer(() => this._executeStepsToSyndicate(isDirectTaskCompletion), "syndicate_Material")
            },
            _executeStepsToSyndicate: async function (isDirectTaskCompletion = false) {
                let that = this,
                    bShowMsg = false,
                    frameDtoFor = "Validate",
                    oView = this.getView(),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    isBasicDataValidated = await that.fnValidateMaterialData(); //UI level Mandatory fields check of BasicData tabs.
                if (isBasicDataValidated) {
                    let isPosted = await that.fnPostMaterialDetails(frameDtoFor, bShowMsg); //Saving the material data.
                    if (isPosted) {
                        let SAPValidation = await that.fnToSyndicate(null, true, null, bShowMsg, false); //SAP validation.
                        if (SAPValidation) {
                            bShowMsg = true;
                            let SAPSyndication = await that.fnToSyndicate(null, false, null, bShowMsg, false); // SAP Syndication Call.
                            if (SAPSyndication) {
                                let plantDataList = MaterialDetails.getProperty("/OrganizationalData/selectedPlants") || [];
                                if (requestType == 6) {
                                    if (isDirectTaskCompletion || !(plantDataList && plantDataList.length > 0)) {
                                        that.fnDirectPlantSync();
                                    }
                                    else {
                                        that.onGetWFValidatedContext();
                                    }
                                }
                                else if (requestType == 1) {
                                    if ((plantDataList && plantDataList.length > 0)) {
                                        that.onGetWFValidatedContext();
                                    }
                                }
                            }
                            else {
                                that.closeBusyDialog();
                            }
                        }
                        else {
                            that.closeBusyDialog();
                        }
                    }
                    else {
                        that.closeBusyDialog();
                    }
                }
                else {
                    that.closeBusyDialog();
                    that.LoadFragment("MD_MissingMandatoryField", oView, true);
                }
            },

            fnChangeMarkforSyncFlag: function (oEvent) {
                let state = oEvent.getSource().getState(),
                    sPath = oEvent.getSource().getParent().getBindingContext("MaterialDetails").sPath,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    system;
                system = MaterialDetails.getProperty(sPath).MM_SYSTEM_ID;

                if (state) {
                    let confirmationMsg = this.resourceBundle.getText("enableForSyndication"),
                        actions = ["NO", "YES"],
                        that = this;

                    this.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            that.handleBasicDataProperties(system);
                        }
                        else {
                            MaterialDetails.setProperty(sPath + "/markForSyndication", !state);
                            that.handleBasicDataProperties(system);
                        }
                    });
                }
                else {
                    let confirmationMsg = this.resourceBundle.getText("disbleForSyndication"),
                        actions = ["NO", "YES"],
                        that = this;

                    this.showMessage(confirmationMsg, "Q", actions, "YES", async function (action) {
                        let localRefModel = new sap.ui.model.json.JSONModel(),
                            MaterialDetailsPath = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MaterialDetails.json"),
                            BasicData1Required, BasicData2Required, MaterialDetailsData;
                        that.getView().setModel(localRefModel, "localRefModel");
                        await localRefModel.loadData(MaterialDetailsPath);
                        MaterialDetailsData = localRefModel.getData();
                        if (action === "YES") {
                            //Basic Data 1
                            BasicData1Required = JSON.parse(JSON.stringify(MaterialDetailsData?.SystemDetails.basicData1));
                            BasicData2Required = JSON.parse(JSON.stringify(MaterialDetailsData?.SystemDetails.basicData2));
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/generalData/required`, BasicData1Required?.generalData?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/matAuthGroup/required`, BasicData1Required?.matAuthGroup?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/dimensionsEans/required`, BasicData1Required?.dimensionsEans?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/packagingMatData/required`, BasicData1Required?.packagingMatData?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/advTrackTrace/required`, BasicData1Required?.advTrackTrace?.required);

                            //Basic Data 2
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/otherData/required`, BasicData2Required?.otherData?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/environment/required`, BasicData2Required?.environment?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designDocAssigned/required`, BasicData2Required?.designDocAssigned?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designdrawing/required`, BasicData2Required?.designdrawing?.required);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/clientSpecificConfig/required`, BasicData2Required?.clientSpecificConfig?.required);

                            //Additional Datas
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/descriptionData/descMandatory`, false);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/basicDataText/basicTextMandatory`, false);
                        }
                        else {
                            MaterialDetails.setProperty(sPath + "/markForSyndication", !state);
                        }
                        localRefModel.destroy();
                    });

                }
            },

            //Workflow 
            onSubmitRequest: function () {
                this.debouncedButtonTimer(
                    this.onGetWFValidatedContext,
                    "submit-request"
                    // 3000 is default, or pass custom delay as 3rd param
                );
            },

            onSearchRequestChangeLog: function (oEvent) {
                let inputValue = oEvent.getSource().getValue(),
                    CreateProject = this.getModelDetails("CreateProject");

                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/inputValue", inputValue);
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/currentPage", 1);         //To go to page 1 whenever user clicks on Search button
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/start", 1)    //To set the pagination tray start to 1 whenever user clicks on Search button  
                this.fnGetRequestChangeRequestLog();

            },

            fnGetRequestChangeRequestLog: function () {
                let CreateProject = this.getModelDetails("CreateProject"),
                    inputValue = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/inputValue"),
                    currentPage = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/currentPage") - 1,
                    rowsPerPage = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/rowsPerPage"),
                    requestNumber = CreateProject.getProperty("/RequestHeader/data/requestNumber"),
                    that = this,
                    searchPayload;
                searchPayload =
                {
                    "requestNumber": requestNumber,
                    "fieldName": inputValue,
                    "page": currentPage,
                    "size": rowsPerPage
                }
                this.onSetTimeOut(1000).then(() => {
                    that.onTriggerSearchRequestChangeLog(searchPayload);
                });
            },

            onTriggerSearchRequestChangeLog: function (searchPayload) {
                let that = this,
                    CreateProject = this.getModelDetails("CreateProject"),
                    requestNumber = CreateProject.getProperty("/RequestHeader/data/requestNumber");
                if (requestNumber) {
                    that.fnProcessDataRequest("MM_JAVA/getAuditLogByRequestNumberPagination", "POST", null, true, searchPayload,
                        function (responseData) {
                            if (responseData.result) {
                                CreateProject.setProperty("/requestChangeHistory/historyDetails", responseData.result.changeLogDtoList);
                                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/totalrecords", responseData.result.totalCount);
                                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/totalPages", responseData.result.totalPages);
                                that.paginationRequestChangeLog();
                                that.closeBusyDialog();
                                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/footerVisible", true);
                                if (responseData.result.totalPages === 0) {
                                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/footerVisible", false);
                                }
                            }
                        },
                        function (responseData) {
                            CreateProject.setProperty("/PaginationDetailsRequestChangeLog/footerVisible", false);
                        });
                }
            },

            onSetPaginationTrayTextRequestChange: function () {
                var CreateProject = this.getModelDetails("CreateProject"),
                    paginationTrayStart = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/trayDetails/start"),
                    paginationTrayEnd,
                    totalPagesArray = [],
                    totalPages = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/totalPages");
                if (paginationTrayStart + 4 <= totalPages) {                  //Condition to set the pagination tray end according to number of total pages
                    paginationTrayEnd = paginationTrayStart + 4;
                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/end", paginationTrayStart + 4);
                }
                else {
                    paginationTrayEnd = totalPages;
                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/end", totalPages);
                }
                for (let page = paginationTrayStart; page <= paginationTrayEnd; page++) {
                    totalPagesArray.push({ "page": page });
                }
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/totalPagesArray", totalPagesArray);
            },

            paginationRequestChangeLog: function () {
                var CreateProject = this.getModelDetails("CreateProject"),
                    totalPages = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/totalPages");
                if (totalPages <= 5) {
                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/end", totalPages);
                }
                this.onSetPaginationTrayTextRequestChange();
                //For addding MM_ActivePaginationLinkColor to link of page 1 when loading the screen.
                var currentPage = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/currentPage");
                function checkCurrent(item) {
                    if (item.getText() == 1 && currentPage == 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
            },

            onPageClickRequestChangeLog: function (oEvent) {
                this.getView().getControlsByFieldGroupId().map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId().map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                var CreateProject = this.getModelDetails("CreateProject"),
                    selectedPage = oEvent.getSource().getText();
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/currentPage", parseInt(selectedPage));
                oEvent.getSource().removeStyleClass("MM_PaginationLinkColor");
                oEvent.getSource().addStyleClass("MM_ActivePaginationLinkColor");
                this.fnGetRequestChangeRequestLog();
            },

            onNextPageRequestChangeLog: function () {
                var CreateProject = this.getModelDetails("CreateProject"),
                    currentPage = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/currentPage"),
                    paginationTrayStart = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/trayDetails/start"),
                    paginationTrayEnd = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/trayDetails/end");
                if (currentPage === paginationTrayEnd) {
                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/start", paginationTrayStart + 1);
                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/end", paginationTrayEnd + 1);
                    this.onSetPaginationTrayTextRequestChange();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/currentPage", currentPage + 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage + 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.fnGetRequestChangeRequestLog();
            },

            onPrevPageRequestChangeLog: function () {
                var CreateProject = this.getModelDetails("CreateProject"),
                    currentPage = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/currentPage"),
                    paginationTrayStart = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/trayDetails/start"),
                    paginationTrayEnd = CreateProject.getProperty("/PaginationDetailsRequestChangeLog/trayDetails/end");
                if (currentPage === paginationTrayStart) {
                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/start", paginationTrayStart - 1);
                    CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/end", paginationTrayEnd - 1);
                    this.onSetPaginationTrayTextRequestChange();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/currentPage", currentPage - 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage - 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.fnGetRequestChangeRequestLog();
            },

            onSelectPageSizeRequestChangeLog: function (oEvent) {
                var rowsPerPage = parseInt(oEvent.getSource().getSelectedItem().mProperties.text),
                    CreateProject = this.getModelDetails("CreateProject");
                //Just to remove the previous selection in css
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/rowsPerPage", rowsPerPage);
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/currentPage", 1);
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/start", 1);
                CreateProject.setProperty("/PaginationDetailsRequestChangeLog/trayDetails/end", 5);
                this.fnGetRequestChangeRequestLog();
            },

            onGetWFValidatedContext: function () {
                let materialType = this.fnGetRequestHeaderData("materialType"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber");
                this.fnGetWFValidatedContext(materialType, requestType, requestNumber, this.gViewName);
            },

            onRefreshWorkflow: function () {
                var requestNumber = this.fnGetRequestHeaderData("requestNumber");
                this.getWorkflowDetails(requestNumber, "CreateProject", "materialmasterworkflow");
            },

            // WORKFLOW ACTIONS
            onReSubmissionTask: function () {
                var wfAction = 1;
                this.onOpenCommentsPopScreen(wfAction);
            },

            fnOnTaskApprovalRecalculation: async function (wfAction) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    materialType = this.fnGetRequestHeaderData("materialType"),
                    requestNumber = this.onGetRequestNo(),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    wfTaskType = this.fnGetWfDetailsModelData("wfTaskType");
                if ((requestType == 3 || requestType == 2) && (wfTaskType == "GMDM_WF_Task" || wfTaskType == "Requester_Rework_WF_Task")) {
                    let frameDtoFor = "Validate",
                        bShowMsg = false;
                    await this.fnPostMaterialDetails(frameDtoFor, bShowMsg);
                }
                if (requestType == 3 && (wfTaskType == "GMDM_WF_Task" || wfTaskType == "Requester_Rework_WF_Task")) { // Only for Change Process
                    let latestContext = null;
                    CreateProject.setProperty("/GeneralData/wfApproverChainRecalculateForModify/isToSplitRequests", false);
                    await this.fnGetWFValidatedContext(materialType, requestType, requestNumber, this.gViewName);
                    latestContext = CreateProject.getProperty("/GeneralData/wfApproverChainRecalculateForModify/resetContextData");
                    if (latestContext?.workflowTaskDetails?.lastApproverTaskName === wfTaskType) {
                        wfAction = 3;
                    }
                    else {
                        wfAction = 2;
                    }
                }
                this.onOpenCommentsPopScreen(wfAction);
            },

            onApproveTask: async function () {
                var wfAction = 2; //For Approve
                this.fnOnTaskApprovalRecalculation(wfAction);
            },

            onCompleteRequestTask: function(){
                this.debouncedButtonTimer(this._executeCompleteRequestTask, "completeTaskBtn");
            },
            _executeCompleteRequestTask: function () {
                var wfAction = 3; // For Complete
                this.fnOnTaskApprovalRecalculation(wfAction);
            },

            onSendToGQMDTask: function () {
                var wfAction = 4;
                this.onOpenCommentsPopScreen(wfAction);
            },

            onRejectTask: function (oEvent) {
                var wfAction = 5; // for Reject
                this.onOpenCommentsPopScreen(wfAction);
            },

            onReturnToRequestorTask: function () {
                var wfAction = 6;//for Return to Requestor
                this.onOpenCommentsPopScreen(wfAction);
            },

            onReturnToGMDMTask: function () {
                var wfAction = 7; //For Returning back to GMDM by GQMD Approver
                this.onOpenCommentsPopScreen(wfAction);
            },

            onCancelTask: function () {
                var wfAction = 8; //For cancelling in Return to Requestor by Requestor
                this.onOpenCommentsPopScreen(wfAction);
            },
            // Req Level Comments

            onPostReqLevelComments: function (oEvent) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    comments = oEvent.getParameter("value"),
                    isReqLevel = true,
                    requestNumber = this.onGetRequestNo();
                this.fnPostComments(requestNumber, null, null, "CreateProject", comments, isReqLevel);
            },

            onPressEsignbtn: async function (oEvent) {
                var oView = this.getView();
                await this.LoadFragment("digitalSignature", oView, true);
            },

            fnEncryptPassword: function (oEvent) {
                var sValue = oEvent.getSource().getValue(),
                    createProjectModel = this.getModelDetails("CreateProject");

                if (sValue) {
                    sValue = btoa(sValue);
                    createProjectModel.setProperty("/eSign/data/password", sValue);
                }
            },

            onValidateDigitalSignature: function (oEvent) {
                this.openBusyDialog();
                var that = this,
                    i18nModel = this.getModelDetails("i18n"),
                    appModel = this.getModelDetails("oAppModel"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    createProjectModel = this.getModelDetails("CreateProject"),
                    oGroupSearchSrvModel = this.getModelDetails("ZapiOdataModel"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    selectedMaterialData = createProjectModel.getProperty("/MaterialList/selectedMaterialData"),
                    oResourceBundle = i18nModel.getResourceBundle(),
                    lookupData = LookupModel.getData(),
                    currentUserMailID = appModel.getProperty("/userdetails/userMailID"),
                    errorAlert = oResourceBundle.getText("errorValidation"),
                    userId = createProjectModel.getProperty("/eSign/data/userId"),
                    remarks = createProjectModel.getProperty("/eSign/data/remark"),
                    password = createProjectModel.getProperty("/eSign/data/password"),
                    url = "/LoginUserCheckSet(UserId='" + userId + "',Password='" + password + "')?$format=json";
                var eSignJavaPayload = {
                    "requestNumber": selectedMaterialData?.requestNumber,
                    "materialNumber": selectedMaterialData?.materialNumber,
                    "materialListId": selectedMaterialData?.materialListId,
                    "esignBy": currentUserMailID,
                    "esignedOn": that.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                    "esignRemarks": parseInt(remarks),
                    "source": "Request_Management"
                },
                    validateEsignArray = [
                        {
                            "path": "/eSign/valueState/userId",
                            "value": userId,
                            "type": "input"
                        },
                        {
                            "path": "/eSign/valueState/password",
                            "value": password,
                            "type": "input"
                        },
                        {
                            "path": "/eSign/valueState/remark",
                            "value": remarks,
                            "items": lookupData.esignRemark,
                            "parameter": "MM_ESIGN_KEY",
                            "type": "combobox"
                        }

                    ],
                    isValid = this.validateInputData("CreateProject", validateEsignArray);
                if (isValid) {
                    oGroupSearchSrvModel.read(url, null, null, false,
                        function (resData) {
                            if (resData.Message_type === "success") {
                                that.fnProcessDataRequest("MM_JAVA/saveEsign", "POST", null, true, eSignJavaPayload,
                                    async function (responseData) {
                                        that.closeBusyDialog();
                                        that.onCancelDigitalSignature();
                                        if (requestType == 6) {
                                            that.onSyndicateBtn();
                                        }
                                        else {
                                            //To Syndicate material after successfull e-sign 
                                            let isSyncValidated = await that.fnToSyndicate(null, true, null, false, false);
                                            if (isSyncValidated) {
                                                let isSyncSuccess = await that.fnToSyndicate(null, false, false, false);
                                                //TODO
                                                // Check if there are documents present for syndication-->mark for syndication true
                                                // included true
                                                if (isSyncSuccess) {
                                                    let documentSyndicationConfirmationMsg = that.resourceBundle.getText("documentSyndicationConfirmationMsg"),
                                                        actions = ["YES", "NO"];
                                                    let documentSyndication = that.fnCheckDocumentToSyndicate();
                                                    if (documentSyndication) {
                                                        that.showMessage(documentSyndicationConfirmationMsg, "Q", actions, "YES", function (action) {
                                                            if (action === "YES") {
                                                                // debugger;
                                                                that.onPressSyndicateDocument();
                                                            } else {

                                                                that.onGetClaimTask();

                                                            }
                                                        });
                                                    } else {
                                                        that.onGetClaimTask();

                                                    }
                                                }

                                            }
                                        }
                                    },
                                    function (responseData) {
                                        that.closeBusyDialog();
                                    }
                                );

                            }
                            else {
                                that.closeBusyDialog();
                                MessageBox.alert(errorAlert);
                            }
                        });
                }
                else {
                    this.showMessage(that.resourceBundle.getText("errorValidation"));
                    that.closeBusyDialog();
                }

            },

            onCancelDigitalSignature: function () {
                var eSignParameters = {
                    "data": {
                        "userId": "",
                        "password": ""
                    },
                    "valueState": {
                        "userId": "None",
                        "password": "None",
                        "remark": "None"
                    }
                },
                    createProjectModel = this.getModelDetails("CreateProject");
                createProjectModel.setProperty("/eSign", eSignParameters)
                this.byId("id_digitalSignature").close();
            },

            fnFormLineNoMatNoLookup: function () {
                let CreateProject = this.getModelDetails("CreateProject"),
                    materialList = CreateProject.getProperty("/MaterialList/materialList"),
                    lineNoMatNoLookup = [];
                materialList?.map(item => {
                    lineNoMatNoLookup?.push(
                        {
                            "Key": item?.materialListId,
                            "Text": item?.materialNumber ? `${item?.line} - ${item?.materialNumber}` : item?.line
                        }
                    )
                });
                CreateProject.setProperty("/changeLogSummary/lineNoMatNoLookup", lineNoMatNoLookup);
            },

            fnToCallChngLogSummaryAPI: function (requestNumber, materialListId) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    url = "MM_JAVA/getChangeLogSummary",
                    payload = {
                        "requestNumber": requestNumber || null,
                        "materialListId": materialListId || null
                    },
                    that = this;
                this.fnProcessDataRequest(url, "POST", null, true, payload,
                    function (responseData) {
                        CreateProject.setProperty("/changeLogSummary/changeLogSummaryList", responseData?.response);
                        that.closeBusyDialog();
                    },
                    function (error) {
                        CreateProject.setProperty("/changeLogSummary/changeLogSummaryList", []);
                        that.closeBusyDialog();
                    }
                );
            },

            fnClickReqChngLogSummary: function () {
                let oView = this.getView(),
                    CreateProject = this.getModelDetails("CreateProject"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId");
                // url = "MM_JAVA/getRequestLevelChangeLogSummary?requestNumber=" + requestNumber; // this service not getting utilized anymore
                this.fnFormLineNoMatNoLookup();
                if (materialListId) {
                    CreateProject.setProperty("/changeLogSummary/selectedLineNoMatListId", materialListId);
                    this.fnToCallChngLogSummaryAPI(requestNumber, materialListId);
                } else {
                    CreateProject.setProperty("/changeLogSummary/selectedLineNoMatListId", null);
                    CreateProject.setProperty("/changeLogSummary/changeLogSummaryList", []);
                }
                this.LoadFragment("requestChangeLogSummary", oView, true);
            },

            onChangeLineNoMatNo: function () {
                let CreateProject = this.getModelDetails("CreateProject"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    materialListId = CreateProject.getProperty("/changeLogSummary/selectedLineNoMatListId");
                if (materialListId) {
                    this.fnToCallChngLogSummaryAPI(requestNumber, materialListId);
                } else {
                    CreateProject.setProperty("/changeLogSummary/changeLogSummaryList", []);
                }
            },

            onCloseRequestChangeLogSummary: function () {
                this.byId("id_RequestChangeLogSummary").close();
            }
        });
    });