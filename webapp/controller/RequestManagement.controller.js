sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/viatris/materialmaster/controller/BaseController",
    "com/viatris/materialmaster/model/formatter",
    "sap/ui/model/json/JSONModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, BaseController, formatter, JSONModel) {
        "use strict";
        return BaseController.extend("com.viatris.materialmaster.controller.RequestManagement", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.resourceBundle = this.getModelDetails("i18n").getResourceBundle();
                this._onRouteMatched();
                this.oRouter.getRoute("RequestManagement").attachPatternMatched(this._onRouteMatched, this);

                // this._readFilterDropdownFields();
            },

            _onRouteMatched: async function () {
                var createProject = this.getModelDetails("CreateProject"),
                    RequestManagement = this.getModelDetails("RequestManagement"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    createProjectLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/CreateProject.json"),
                    RequestManagementLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/RequestManagement.json"),
                    RequestManagementLocalModel = new JSONModel(),       //To store the filter details in order to not refresh filter on request navigation
                    existingRequestManagementPagination = RequestManagement.getProperty("/PaginationDetails"),
                    RequestManagementLocalModelData;

                createProject.setProperty("/MaterialList/generalDetails/attributeListProdData",null);
                this.getView().setModel(RequestManagementLocalModel, "RequestManagementLocalModel");
                await RequestManagementLocalModel.loadData(RequestManagementLocation);

                await createProject.loadData(createProjectLocation);
                
                if(!existingRequestManagementPagination ||!existingRequestManagementPagination.selectRowsPerPage || !existingRequestManagementPagination.currentPage){
                    RequestManagementLocalModelData = RequestManagementLocalModel.getData();
                    RequestManagement.setProperty("/PaginationDetails", RequestManagementLocalModelData.PaginationDetails);
                    RequestManagement.setProperty("/RequestDetailList", RequestManagementLocalModelData.RequestDetailList);
                }
                oAppModel.setProperty("/sideNavigation/setSelectedKey", "PageRequestManagement");
                oAppModel.setProperty("/sideNavigation/icon/RequestManagement", "sap-icon://folder-full");
                // oAppModel.setProperty("/productDataOutline", null); //To empty the Dynamic UI outline for productData.
                this.onGetFilteredData();
                this.ongetCreatedBy();
                // this.onGetRulesDataMaterialStatus("NCHAR_04");
            },

            _readFilterDropdownFields: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    that = this;
                // RepositoryModel = this.getModelDetails("Repository");

                this.fnProcessDataRequest("MM_JAVA/getAllFieldNamesDropdown", "GET", null, true, null,
                    function (responseData) {
                        if (responseData) {
                            LookupModel.setProperty("/RequestManagement/AdvSearchFieldsList", responseData);
                            // RepositoryModel.setProperty("/FilterOptions/All_FilterFields", responseData);

                            that.closeBusyDialog();
                        }
                    },
                    function (oError) {
                        //Error
                    }
                );
            },

            getViewName: function () {
                return "RequestManagement";
            },


            //When the Create Project Button is pressed
            onCreateRequest: function () {
                let oAppModel = this.getModelDetails("oAppModel"),
                    createProject = this.getModelDetails("CreateProject"),
                    requestManagement = this.getModelDetails("RequestManagement"),
                    currentDate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                    currentUser = oAppModel.getProperty("/userdetails/userMailID"),
                    requestHeader = {};
                requestHeader = {
                    "requestStatus": "DRAFT",
                    "createdOn": currentDate,
                    "createdBy": currentUser,
                    "changedOn": currentDate,
                    "changedBy": currentUser,
                    "requestStatus": 1,
                    "scenario": 1 //to create new project
                };
                createProject.setProperty("/RequestHeader/data", requestHeader);
                // requestManagement.setProperty("/fromRequestMangementPage", true);
                requestManagement.setProperty("/source", "requestManagement");
                createProject.setProperty("/productDataOutline", null);
                this.navigateTo("CreateProject");
            },

            onExportExcel: function (oEvent) {
                let that = this,
                    requestManagement = this.getModelDetails("RequestManagement"),
                    filterData = requestManagement.getProperty("/FilterDetails"),
                    filterPayload = {},
                    requestCreationDateRange = filterData.requestCreationDateRange || "",
                    priority = filterData.priority || false,
                    oView = this.getView();
                // requestRequiredDateRange = filterData.requestRequiredDateRange || "";
                filterPayload =
                {
                    "createdBy": this.onGetNullValue(filterData.createdBy, "string"),
                    "requestNumber": this.onGetNullValue(filterData.requestID, "string"),
                    "requestTypeId": this.onGetNullValue(filterData.requestType, "int"),
                    "requestDescription": this.onGetNullValue(filterData.requestDescription, "string"),
                    "requestStatusId": this.onGetNullValue(filterData.requestStatus, "int"),
                    "createdOn": this.onGetNullValue(requestCreationDateRange, "string"),
                    // "dateRequired": this.onGetNullValue(requestRequiredDateRange, "string"),
                    "materialTypeId": this.onGetNullValue(filterData.materialType, "int"),
                    "priority": priority,
                    "page": 0,
                    "size": 0
                };

                for (const key in filterPayload) {
                    if (typeof (filterPayload[key]) === "string") {
                        filterPayload[key] = this.onTrim(filterPayload[key]);
                    }
                }

                // this.onSetTimeOut(1000).then(() => {
                // that.fnProcessDataRequest("MM_JAVA/export-to-excel", "POST", null, true, filterPayload,
                //     function (responseData, responseHeader) {
                //         var b64encoded = responseData.base64;
                //         var link = document.createElement('a'),
                //             fileName = responseHeader.getResponseHeader("content-disposition").substring(responseHeader.getResponseHeader("content-disposition").indexOf('=', 0) + 1);
                //         link.innerHTML = 'Download Excel file';
                //         link.download = `${fileName}.xlsx`;
                //         link.href = 'data:application/octet-stream;base64,' + b64encoded;
                //         link.click();
                //         that.closeBusyDialog();
                //         that.showMessage(that.resourceBundle.getText("reportDownloadedSuccessfully"));
                //     },
                //     function (responseData) {
                //         that.closeBusyDialog();
                //         that.showMessage(that.resourceBundle.getText("downloadFailed"));
                //     });
                // });


                this.LoadFragment("RequestManagement_DownloadData", oView, true);

            },

            onItemPressOfDownloadData: function (oEvent) {
                let listItem = oEvent.getParameters("listItem").listItem;
                let title = oEvent.getParameters("listItem").listItem.mProperties.title;
                let sPath = oEvent.getParameters().listItem.mBindingInfos.title.binding.oContext.sPath;
                let DownloadData = this.getModelDetails("DownloadData");
                let key = DownloadData.getProperty(`${sPath}/name`);
                if (key === "REQUEST_HEADER" || key==="MATERIAL_HEADER") {
                    oEvent.getSource().setSelectedItem(listItem, true);
                }
            },

            onClickDownloadData: function (oEvent) {
                let DownloadDataList = this.getView().byId("DownloadDataList"),
                    selectedItems = DownloadDataList.getSelectedContexts();
                let DownloadData = this.getModelDetails("DownloadData"),
                    listOfSelectedUiView = [];
                selectedItems.map(function (item) {
                    if(DownloadData.getProperty(`${item.sPath}/name`)!="REQUEST_HEADER"){
                        listOfSelectedUiView.push(DownloadData.getProperty(`${item.sPath}/name`));
                    }
                    
                })

                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let requestManagement = this.getModelDetails("RequestManagement"),
                    lookupModel = this.getModelDetails("LookupModel"),
                    filterData = requestManagement.getProperty("/FilterOptions/BasicFilter"),
                    currentPage = requestManagement.getProperty("/PaginationDetails/currentPage") - 1,
                    rowsPerPage = requestManagement.getProperty("/PaginationDetails/rowsPerPage"),
                    filterPayload = {}, fieldValue = "",
                    materialNumberList = [],
                    requestCreationDateRange = filterData.requestCreationDateRange || "",
                    materialNumber = this.onGetNullValue(filterData.materialNumber, "int"),
                    priority = filterData.priority || false,
                    // requestRequiredDateRange = filterData.requestRequiredDateRange || "",
                    advanceFilterTableData = requestManagement.getProperty("/FilterOptions/AdvanceFilter"),
                    advancedSearch = advanceFilterTableData.map((item, index) => (
                        // if (item.viewIdForPayload === "SYSTEM_DATA" && item.fieldKey === "MM_SYSTEM_ID") {
                        //     let fieldValueUpper = item.fieldValue?.trim().toUpperCase();
                        //     // Convert fieldValue to 1 if it is 'gep' or 2 if it is 'rp1'
                        //     switch (fieldValueUpper) {
                        //         case "GEP":
                        //             fieldValue = "1";
                        //             break;
                        //         case "RP1":
                        //             fieldValue = "2";
                        //             break;
                        //         default:
                        //             fieldValue = fieldValueUpper;
                        //     }
                        //     fieldValue = lookupModel.getProperty(`/SystemNameToId/${fieldValueUpper}`) || fieldValueUpper;
                        // }
                        // else {
                        //     fieldValue = item.fieldValue;
                        // }
                        {
                            "fieldName": item.fieldKey,
                            "fieldValue": item.fieldValue,
                            "keySearchType": item.key_searchType,
                            "viewId": item.viewIdForPayload
                        }
                    )),
                    that = this;
                if (materialNumber) {
                    materialNumberList.push(materialNumber);
                }
                filterPayload =
                {
                    "basicSearch": {
                        "createdBy": this.onGetNullValue(filterData.createdBy, "string"),
                        "materialNumber": materialNumberList.length ? materialNumberList : null,
                        "materialDescription": this.onGetNullValue(filterData.materialDescription, "string"),
                        "requestNumber": this.onGetNullValue(filterData.requestID, "string"),
                        "requestTypeId": this.onGetNullValue(filterData.requestType, "int"),
                        "requestDescription": this.onGetNullValue(filterData.requestDescription, "string"),
                        // "rootRequestNumber": this.onGetNullValue(filterData.rootRequestNumber, "string"),
                        // "parentRequestNumber": this.onGetNullValue(filterData.parentRequestNumber, "string"),
                        "requestStatusId": this.onGetNullValue(filterData.requestStatus, "int"),
                        "createdOn": this.onGetNullValue(requestCreationDateRange, "string"),
                        // "dateRequired": this.onGetNullValue(requestRequiredDateRange, "string"),
                        "materialTypeId": this.onGetNullValue(filterData.materialType, "int"),
                        "requestSource": ["Request_Management", "Repository"],
                        "priority": priority,
                        "requestorOrganization": this.onGetNullValue(filterData.requestorOrganization, "string"),
                        "materialStatusId": this.onGetNullValue(filterData.materialStatus, "int")
                    },
                    "page": currentPage,
                    "size": rowsPerPage,
                    "advancedSearch": advancedSearch,
                    "uiView": listOfSelectedUiView,
                    "systemId": []
                };

                for (const key in filterPayload["basicSearch"]) {
                    if (typeof (filterPayload["basicSearch"][key]) === "string") {
                        filterPayload["basicSearch"][key] = this.onTrim(filterPayload["basicSearch"][key]);
                    }
                }
                for (const key in filterPayload["advancedSearch"]) {
                    if (typeof (filterPayload["advancedSearch"][key]) === "string") {
                        filterPayload["advancedSearch"][key] = this.onTrim(filterPayload["advancedSearch"][key]);
                    }
                }
                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                that.fnProcessDataRequest("MM_JAVA_MASS/searchDynamicRequestHeaderDataDownload", "POST", null, true, filterPayload,
                    function (responseData, responseHeader) {
                        that.closeBusyDialog();
                        if (responseData.responseMessage.statusCode == 500) {
                            that.showMessage(responseData.responseMessage.responseMessage);
                        } else {
                            var b64encoded = responseData.base64;
                            var link = document.createElement('a'),
                                fileName = responseHeader.getResponseHeader("content-disposition").substring(responseHeader.getResponseHeader("content-disposition").indexOf('=', 0) + 1);
                            link.innerHTML = 'Download Excel file';
                            link.download = `${fileName}.xlsx`;
                            link.href = 'data:application/octet-stream;base64,' + b64encoded;
                            link.click();
                            that.showMessage(that.resourceBundle.getText("reportDownloadedSuccessfully"));
                            that.onCloseDownloadData();
                        }

                    },
                    function (responseData) {
                        that.closeBusyDialog();
                        that.showMessage(that.resourceBundle.getText("downloadFailed"));
                    });
            },

            onCloseDownloadData: function (oEvent) {
                this.getView().byId("id_RequestManagement_DownloadData").close();
            },

            onSearchData: function () {
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                let requestManagement = this.getModelDetails("RequestManagement");
                requestManagement.setProperty("/PaginationDetails/currentPage", 1);         //To go to page 1 whenever user clicks on Search button
                requestManagement.setProperty("/PaginationDetails/trayDetails/start", 1)    //To set the pagination tray start to 1 whenever user clicks on Search button  
                this.onGetFilteredData();
            },

            onGetFilteredData: function () {
                let requestManagement = this.getModelDetails("RequestManagement"),
                    lookupModel = this.getModelDetails("LookupModel"),
                    filterData = requestManagement.getProperty("/FilterOptions/BasicFilter"),
                    currentPage = requestManagement.getProperty("/PaginationDetails/currentPage") - 1,
                    rowsPerPage = requestManagement.getProperty("/PaginationDetails/rowsPerPage"),
                    filterPayload = {}, fieldValue = "",
                    materialNumberList = [],
                    requestCreationDateRange = filterData.requestCreationDateRange || "",
                    materialNumber = this.onGetNullValue(filterData.materialNumber, "int"),
                    priority = filterData.priority || false,
                    // requestRequiredDateRange = filterData.requestRequiredDateRange || "",
                    advanceFilterTableData = requestManagement.getProperty("/FilterOptions/AdvanceFilter"),
                    advancedSearch = advanceFilterTableData.map((item, index) => (
                        // if (item.viewIdForPayload === "SYSTEM_DATA" && item.fieldKey === "MM_SYSTEM_ID") {
                        //     let fieldValueUpper = item.fieldValue?.trim().toUpperCase();
                        //     // Convert fieldValue to 1 if it is 'gep' or 2 if it is 'rp1'
                        //     // switch (fieldValueUpper) {
                        //     //     case "GEP":
                        //     //         fieldValue = "1";
                        //     //         break;
                        //     //     case "RP1":
                        //     //         fieldValue = "2";
                        //     //         break;
                        //     //     default:
                        //     //         fieldValue = fieldValueUpper;
                        //     // }
                        //     fieldValue = lookupModel.getProperty(`/SystemNameToId/${fieldValueUpper}`) || fieldValueUpper;
                        // }
                        // else {
                        //     fieldValue = item.fieldValue;
                        // }
                        {
                            "fieldName": item.fieldKey,
                            "fieldValue": item.fieldValue,
                            "keySearchType": item.key_searchType,
                            "viewId": item.viewIdForPayload
                        }
                    )),
                    that = this;
                if (materialNumber) {
                    materialNumberList.push(materialNumber);
                }
                filterPayload =
                {
                    "basicSearch": {
                        "createdBy": this.onGetNullValue(filterData.createdBy, "string"),
                        "materialNumber": materialNumberList.length ? materialNumberList : null,
                        "materialDescription": this.onGetNullValue(filterData.materialDescription, "string"),
                        "requestNumber": this.onGetNullValue(filterData.requestID, "string"),
                        "requestTypeId": this.onGetNullValue(filterData.requestType, "int"),
                        "requestDescription": this.onGetNullValue(filterData.requestDescription, "string"),
                        // "rootRequestNumber": this.onGetNullValue(filterData.rootRequestNumber, "string"),
                        // "parentRequestNumber": this.onGetNullValue(filterData.parentRequestNumber, "string"),
                        "requestStatusId": this.onGetNullValue(filterData.requestStatus, "int"),
                        "createdOn": this.onGetNullValue(requestCreationDateRange, "string"),
                        // "dateRequired": this.onGetNullValue(requestRequiredDateRange, "string"),
                        "materialTypeId": this.onGetNullValue(filterData.materialType, "int"),
                        "requestSource": ["Request_Management", "Repository"],
                        "priority": priority,
                        "requestorOrganization": this.onGetNullValue(filterData.requestorOrganization, "string"),
                        "materialStatusId": this.onGetNullValue(filterData.materialStatus, "int")
                    },
                    "page": currentPage,
                    "size": rowsPerPage,
                    "advancedSearch": advancedSearch
                };

                for (const key in filterPayload["basicSearch"]) {
                    if (typeof (filterPayload["basicSearch"][key]) === "string") {
                        filterPayload["basicSearch"][key] = this.onTrim(filterPayload["basicSearch"][key]);
                    }
                }
                for (const key in filterPayload["advancedSearch"]) {
                    if (typeof (filterPayload["advancedSearch"][key]) === "string") {
                        filterPayload["advancedSearch"][key] = this.onTrim(filterPayload["advancedSearch"][key]);
                    }
                }

                this.onSetTimeOut(1000).then(() => {
                    that.onTriggerSearch(filterPayload);
                });
            },

            onTriggerSearch: function (filterPayload) {
                let requestManagement = this.getModelDetails("RequestManagement"),
                    that = this;
                this.fnProcessDataRequest("MM_JAVA/searchDynamicRequestHeaderData", "POST", null, true, filterPayload, function (responseData) {
                    if (responseData.result) {
                        requestManagement.setProperty("/RequestDetailList", responseData.result.mmRequestHeaderDtoList);
                        requestManagement.setProperty("/PaginationDetails/totalrecords", responseData.result.totalCount);
                        requestManagement.setProperty("/PaginationDetails/totalPages", responseData.result.totalPages);
                        that.pagination();
                        that.closeBusyDialog();
                        requestManagement.setProperty("/PaginationDetails/footerVisible", true);
                        if (responseData.result.totalPages === 0) {
                            requestManagement.setProperty("/PaginationDetails/footerVisible", false);
                        }
                    }
                },
                    function (responseData) {
                        requestManagement.setProperty("/PaginationDetails/footerVisible", false);
                    });
            },

            //Clear Filter Data 
            onClearFilterData: function () {
                let requestManagement = this.getModelDetails("RequestManagement"),
                    RequestManagementLocalModel = this.getView().getModel("RequestManagementLocalModel"),
                    RequestManagementLocalModelData = RequestManagementLocalModel.getData();

                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });                   //To set the colour of selected page in pagination tray

                requestManagement.setProperty("/PaginationDetails", RequestManagementLocalModelData.PaginationDetails);
                requestManagement.setProperty("/RequestDetailList", RequestManagementLocalModelData.RequestDetailList);
                requestManagement.setProperty("/PaginationDetails/currentPage", 1);           //To go to page 1 whenever user clicks on Search button
                requestManagement.setProperty("/PaginationDetails/trayDetails/start", 1)      //To set the pagination tray start to 1 whenever user clicks on Search button
                requestManagement.setProperty("/FilterDetails", {});
                //Dynamic Filter
                requestManagement.setProperty("/FilterOptions/BasicFilter", {});
                requestManagement.setProperty("/FilterOptions/AdvanceFilter", []);

                this.onGetFilteredData();
            },

            //Advance Search Fragment - Open Dialog 
            onOpenDynamicSearch: function () {
                let oView = this.getView();
                this.LoadFragment("RequestManagement_AdvanceSearch", oView, true);
                // this.fnUpdateAvailableFieldsList();
            },

            // fnUpdateAvailableFieldsList: function () {
            //     let requestManagement = this.getModelDetails("RequestManagement"),
            //         LookupModel = this.getModelDetails("LookupModel"),
            //         allFilterFields = LookupModel.getProperty("/RequestManagement/AdvSearchFieldsList"),
            //         advanceFilterData = requestManagement.getProperty("/FilterOptions/AdvanceFilter");
            //     allFilterFields = JSON.parse(JSON.stringify(allFilterFields));
            //     let fieldIndex = function (selectedFieldName) {
            //         return allFilterFields.findIndex(element => element["fieldName"] == selectedFieldName);
            //     };
            //     if (advanceFilterData) {
            //         let selectedField = null,
            //             index = -1;;
            //         for (let i = 0; i < advanceFilterData.length; i++) {
            //             //selectedField = advanceFilterData[i].fieldName;
            //             selectedField = advanceFilterData[i].fieldKey;
            //             index = fieldIndex(selectedField);
            //             if (index != -1) {
            //                 allFilterFields.splice(index, 1);
            //             }
            //         }
            //     }
            //     requestManagement.setProperty("/FilterOptions/Applicable_FilterFields", allFilterFields);
            //     requestManagement.refresh(true);
            // },

            //Add the advance filter line item
            onAddAdvanceFilterOption: function () {
                let requestManagement = this.getModelDetails("RequestManagement"),
                    advanceFilterData = requestManagement.getProperty("/FilterOptions/AdvanceFilter"),
                    newAFData = {
                        "fieldName": null,
                        "fieldKey": null,
                        "viewId": null,
                        "fieldNameFinal": null,
                        "viewIdFinal": null,
                        "key_searchType": "equals",
                        "fieldValue": null,
                        "viewIdVisible": true,
                        "bFieldType": true,
                        "fieldNameList": []
                    };
                if (!advanceFilterData) {
                    advanceFilterData = [];
                }
                advanceFilterData.push(newAFData);
                // this.fnUpdateAvailableFieldsList();
                requestManagement.setProperty("/FilterOptions/AdvanceFilter", advanceFilterData);
            },

            //Function - Delete the filter line item
            // onDeleteAFData: function (oEvent) {
            //     var requestManagement = this.getModelDetails("RequestManagement"),
            //         selectedPath = oEvent.getSource().getBindingContext("RequestManagement").sPath,
            //         listOfAllAFData = requestManagement.getProperty("/FilterOptions/AdvanceFilter");
            //     this._deleteSelectedRow(selectedPath, listOfAllAFData, "RequestManagement");

            //     // this.fnUpdateAvailableFieldsList();
            // },

            onDeleteAFData: function (oEvent) {
                var requestManagement = this.getModelDetails("RequestManagement"),
                    selectedPath = oEvent.getSource().getBindingContext("RequestManagement").sPath,
                    listOfAllAFData = requestManagement.getProperty("/FilterOptions/AdvanceFilter"),
                    selectedIndex = parseInt(selectedPath.split("/").pop()); // extract index from path
            
                this._deleteSelectedRow(selectedIndex, listOfAllAFData, "RequestManagement");
            },

            //Change function - combobox selection
            onChangeFieldSelection: function (oEvent) {
                var requestManagement = this.getModelDetails("RequestManagement"),
                    oSource = oEvent.getSource();
                // this.fnHandleComboboxValidation(oEvent);
                //Table current line Item
                var oSelectedLineItem = oSource.getBindingContext("RequestManagement").getObject();
                //Selected Item from combobox
                var oSelectedItem = oSource.getSelectedItem().getBindingContext("RequestManagement").getObject();
                oSelectedLineItem.fieldNameFinal = oSelectedLineItem.fieldName;
                oSelectedLineItem.fieldKey = oSelectedLineItem.fieldKey;
                oSelectedLineItem.viewId = oSelectedLineItem.viewId;
                oSelectedLineItem.bFieldType = false;
                requestManagement.refresh(true);
                // this.fnUpdateAvailableFieldsList();
            },

            onChangeViewIdSelection: function(oEvent){
                this.debouncedButtonTimer(()=> this._executeChangeViewIdSelection(oEvent),"repo-adv-search", 2000);

            },
            _executeChangeViewIdSelection: function (oEvent) {
                var RequestManagement = this.getModelDetails("RequestManagement"),
                    oSource = oEvent.getSource(),
                    LookupModel = this.getModelDetails("LookupModel"),
                    ReqMgmtAdvViewIdList = LookupModel.getProperty("/RequestMgmtAdvFilter/viewList");
                // this.fnHandleComboboxValidation(oEvent);
                //Table current line Item
                var oSelectedLineItem = oSource.getBindingContext("RequestManagement").getObject();
                //Selected Item from combobox
                var oSelectedItem = oSource.getSelectedItem().getBindingContext("RequestManagement").getObject();
                oSelectedLineItem.viewIdFinal = oSelectedLineItem.viewId;
                oSelectedLineItem.viewIdForPayload = ReqMgmtAdvViewIdList?.find(item => item.key === oSelectedLineItem.viewId).viewId;
                // oSelectedLineItem.viewId = oSelectedItem.viewId;
                oSelectedLineItem.viewIdVisible = false;
                this.onSelectedViewIdType(oSource, "Request_Management");
            },

            //Close - Search Fragment
            onCloseDynamicSearch: function () {
                this.byId("id_RequestManagement_AdvanceSearch").close();
            },

            onRequestManagementAdvanceFilter: function (oEvent) {
                this.byId("requestManagementTableId").clearSelection();
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                let requestManagement = this.getModelDetails("RequestManagement");
                requestManagement.setProperty("/PaginationDetails/currentPage", 1);
                requestManagement.setProperty("/PaginationDetails/trayDetails/start", 1);

                this.onGetFilteredData();
                this.byId("id_RequestManagement_AdvanceSearch").close();

            },


            onGetRequestDetails: async function (oEvent) {
                if (!(oEvent && oEvent.getParameters().rowContext)) return;
                let requestManagement = this.getModelDetails("RequestManagement"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    createProject = this.getModelDetails("CreateProject"),
                    selectedPath = oEvent.getParameters().rowContext.sPath,
                    requestNumberPath = selectedPath + "/requestNumber",
                    selectedRequestNo = requestManagement.getProperty(requestNumberPath),
                    selectedRequesttype = requestManagement.getProperty(selectedPath + "/requestTypeId"),
                    selectedRequeststatus = requestManagement.getProperty(selectedPath + "/requestStatusId"),
                    matTypeId = requestManagement.getProperty(selectedPath + "/materialTypeId"),
                    that = this;
                this.onGetRequestData(selectedRequestNo);
                createProject.setProperty("/DocComments/docsCommentsFlagCreateProj", false)
            },

            onSetPaginationTrayText: function () {
                var requestManagement = this.getModelDetails("RequestManagement"),
                    paginationTrayStart = requestManagement.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd,
                    totalPagesArray = [],
                    totalPages = requestManagement.getProperty("/PaginationDetails/totalPages");

                if (paginationTrayStart + 4 <= totalPages) {                  //Condition to set the pagination tray end according to number of total pages
                    paginationTrayEnd = paginationTrayStart + 4;
                    requestManagement.setProperty("/PaginationDetails/trayDetails/end", paginationTrayStart + 4);
                }
                else {
                    paginationTrayEnd = totalPages;
                    requestManagement.setProperty("/PaginationDetails/trayDetails/end", totalPages);
                }

                for (let page = paginationTrayStart; page <= paginationTrayEnd; page++) {
                    totalPagesArray.push({ "page": page });
                }
                requestManagement.setProperty("/PaginationDetails/totalPagesArray", totalPagesArray);
            },

            pagination: function () {
                var requestManagement = this.getModelDetails("RequestManagement"),
                    totalPages = requestManagement.getProperty("/PaginationDetails/totalPages");
                if (totalPages <= 5) {
                    requestManagement.setProperty("/PaginationDetails/trayDetails/end", totalPages);
                }
                this.onSetPaginationTrayText();

                //For addding MM_ActivePaginationLinkColor to link of page 1 when loading the screen.
                var currentPage = requestManagement.getProperty("/PaginationDetails/currentPage");
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

            onPageClick: function (oEvent) {
                this.getView().getControlsByFieldGroupId().map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId().map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                var RequestManagement = this.getModelDetails("RequestManagement"),
                    selectedPage = oEvent.getSource().getText();
                RequestManagement.setProperty("/PaginationDetails/currentPage", parseInt(selectedPage));
                oEvent.getSource().removeStyleClass("MM_PaginationLinkColor");
                oEvent.getSource().addStyleClass("MM_ActivePaginationLinkColor");
                this.onGetFilteredData();
            },

            onNextPage: function () {
                var RequestManagement = this.getModelDetails("RequestManagement"),
                    currentPage = RequestManagement.getProperty("/PaginationDetails/currentPage"),
                    paginationTrayStart = RequestManagement.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd = RequestManagement.getProperty("/PaginationDetails/trayDetails/end");
                if (currentPage === paginationTrayEnd) {
                    RequestManagement.setProperty("/PaginationDetails/trayDetails/start", paginationTrayStart + 1);
                    RequestManagement.setProperty("/PaginationDetails/trayDetails/end", paginationTrayEnd + 1);
                    this.onSetPaginationTrayText();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                RequestManagement.setProperty("/PaginationDetails/currentPage", currentPage + 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage + 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.onGetFilteredData();
            },
  
            onPrevPage: function () {
                var RequestManagement = this.getModelDetails("RequestManagement"),
                    currentPage = RequestManagement.getProperty("/PaginationDetails/currentPage"),
                    paginationTrayStart = RequestManagement.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd = RequestManagement.getProperty("/PaginationDetails/trayDetails/end");
                if (currentPage === paginationTrayStart) {
                    RequestManagement.setProperty("/PaginationDetails/trayDetails/start", paginationTrayStart - 1);
                    RequestManagement.setProperty("/PaginationDetails/trayDetails/end", paginationTrayEnd - 1);
                    this.onSetPaginationTrayText();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                RequestManagement.setProperty("/PaginationDetails/currentPage", currentPage - 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage - 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.onGetFilteredData();
            },

            onSelectPageSize: function (oEvent) {
                var rowsPerPage = parseInt(oEvent.getSource().getSelectedItem().mProperties.text),
                    RequestManagement = this.getModelDetails("RequestManagement");
                //Just to remove the previous selection in css
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                RequestManagement.setProperty("/PaginationDetails/rowsPerPage", rowsPerPage);
                RequestManagement.setProperty("/PaginationDetails/selectRowsPerPage", rowsPerPage)
                RequestManagement.setProperty("/PaginationDetails/currentPage", 1);
                RequestManagement.setProperty("/PaginationDetails/trayDetails/start", 1);
                RequestManagement.setProperty("/PaginationDetails/trayDetails/end", 5);
                this.onGetFilteredData();
            },

            onLiveSearchReqManRefMaterial: function (oEvent) {
                var that = this,
                    LookupModel = this.getModelDetails("LookupModel"),
                    filterPayload,
                    sValue = oEvent?.getSource()?.getValue();
                if (this.debouncedSearchTimer) {
                    clearTimeout(this.debouncedSearchTimer);
                }
                filterPayload = {
                    "materialNumber": sValue,
                    "materialType": null,
                    "materialTypeId": null
                }
                this.debouncedSearchTimer = setTimeout(function () {
                    if (sValue.length > 1) {
                        that.fnProcessDataRequest("MM_JAVA/getRequestHeaderMaterialListByMaterialNumber", "POST", null, false, filterPayload,
                            function (responseData) {
                                if (responseData) {
                                    LookupModel.setProperty("/reqManRefMaterial", responseData);
                                }
                            },
                            function (oError) {
                            }
                        );
                    }
                }, 500);
            },

        });
    });
