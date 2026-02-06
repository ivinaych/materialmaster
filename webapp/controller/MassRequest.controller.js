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

        return BaseController.extend("com.viatris.materialmaster.controller.MassRequest", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.resourceBundle = this.getModelDetails("i18n").getResourceBundle();
                this.oRouter.getRoute("MassRequest").attachPatternMatched(this.onBeforeRouteMatched, this);
                this.oRouter.getRoute("MassRequest").attachPatternMatched(this._onRouteMatched, this);
            },

            onBeforeRouteMatched: function (oEvent) {
                let oAppModel = this.getModelDetails("oAppModel"),
                    userRole = oAppModel.getProperty("/userdetails/userRole");
        
                    // Prevent routing
                    if (!(userRole?.includes("Mass Upload Request Submission"))) {
                        // Prevent routing
                        this.navigateTo("NotFoundPage");
                    }
            },

            _onRouteMatched: async function (oEvent) {
                var oAppModel = this.getModelDetails("oAppModel"),
                    MassRequest = this.getModelDetails("MassRequest"),
                    MassRequestLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MassRequest.json"),
                    MassRequestLocalModel = new JSONModel(),       //To store the filter details in order to not refresh filter on request navigation
                    existingPaginationDetails = MassRequest.getProperty("/PaginationDetails"), 
                    MassRequestLocalModelData;

                this.getView().setModel(MassRequestLocalModel, "MassRequestLocalModel");

                await MassRequestLocalModel.loadData(MassRequestLocation);
                if(!existingPaginationDetails || !existingPaginationDetails.selectRowsPerPage || !existingPaginationDetails.currentPage){
                    MassRequestLocalModelData = MassRequestLocalModel.getData();
                    MassRequest.setProperty("/PaginationDetails", MassRequestLocalModelData.PaginationDetails);
                    MassRequest.setProperty("/RequestDetailList", MassRequestLocalModelData.RequestDetailList);
                }
                oAppModel.setProperty("/sideNavigation/icon/MassRequest", "sap-icon://checklist-2");
                oAppModel.setProperty("/sideNavigation/setSelectedKey", "PageMassRequest");
                this._fnGetFilteredData();
                this.ongetCreatedBy();
            },

            getViewName: function () {
                return "MassRequest";
            },
            //TABLE : PRESS EVENT
            onGetMassRequestDetails: function (oEvent) {
                let MassRequest = this.getModelDetails("MassRequest"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    selectedPath = oEvent.getSource().getBindingContext("MassRequest").sPath,
                    requestNumberPath = selectedPath + "/requestNumber",
                    selectedRequestNo = MassRequest.getProperty(requestNumberPath),
                    selectedRequesttype = MassRequest.getProperty(selectedPath + "/requestTypeId"),
                    selectedRequeststatus = MassRequest.getProperty(selectedPath + "/requestStatusId"),
                    matTypeId = MassRequest.getProperty(selectedPath + "/materialTypeId"),
                    //  URL = "MM_JAVA/getAllDetails?requestNumber=" + selectedRequestNo,
                    that = this;
                if (selectedRequeststatus === 1 && selectedRequesttype === 1) {
                    oAppModel.setProperty("/taskDetails/isWorkflowEnabled", false);
                    oAppModel.setProperty("/taskDetails/taskBtnVisibility", false);
                }
                else {
                    oAppModel.setProperty("/taskDetails/isWorkflowEnabled", true);
                    oAppModel.setProperty("/taskDetails/taskBtnVisibility", false);
                }
                this.fnGetMassRequestData(selectedRequestNo);
            },

            onCreateMassRequest: function () {
                let oAppModel = this.getModelDetails("oAppModel"),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    MassRequest = this.getModelDetails("MassRequest"),
                    currentDate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                    currentUser = oAppModel.getProperty("/userdetails/userMailID"),
                    requestHeader = {};
                requestHeader = {
                    "createdOn": currentDate,
                    "createdBy": currentUser,
                    "changedOn": currentDate,
                    "changedBy": currentUser,
                    "requestStatus": 1,
                    "scenario": 1 //to create new project as Draft State
                };
                CreateMassRequest.setProperty("/RequestHeader/data", requestHeader);
                MassRequest.setProperty("/fromMassRequestPage", true);
                CreateMassRequest.setProperty("/RequestHeader/valueState", {});
                CreateMassRequest.setProperty("/RequestHeader/editable", {});
                this.navigateTo("CreateMassRequest");
            },

            onExportExcel: function (oEvent) {
                var that = this,
                    massRequestModel = this.getModelDetails("MassRequest"),
                    filterData = massRequestModel.getProperty("/FilterDetails"),
                    filterPayload = {},
                    requestCreationDateRange = filterData.requestCreationDateRange || "",
                    priority = filterData.priority || false;
                    // requestRequiredDateRange = filterData.requestRequiredDateRange || "";
                filterPayload =
                {
                    "createdBy": this.onGetNullValue(filterData.createdBy, "string"),
                    "requestNumber": this.onGetNullValue(filterData.massRequestID, "string"),
                    "requestTypeId": this.onGetNullValue(filterData.key_requestType, "int"),
                    "requestDescription": this.onGetNullValue(filterData.massRequestDesc, "string"),
                    "requestStatusId": this.onGetNullValue(filterData.key_requestStatus, "int"),
                    "createdOn": this.onGetNullValue(requestCreationDateRange, "string"),
                    // "dateRequired": this.onGetNullValue(requestRequiredDateRange, "string"),
                    "priority": priority,
                    "page": 0,
                    "size": 0
                };

                for (const key in filterPayload) {
                    if (typeof (filterPayload[key]) === "string") {
                        filterPayload[key] = this.onTrim(filterPayload[key]);
                    }
                }

                this.onSetTimeOut(1000).then(() => {
                    that.fnProcessDataRequest("MM_JAVA_MASS/export-to-massRequestExcel", "POST", null, true, filterPayload,
                        function (responseData, responseHeader) {
                            var b64encoded = responseData.base64;
                            var link = document.createElement('a'),
                                fileName = responseHeader.getResponseHeader("content-disposition").substring(responseHeader.getResponseHeader("content-disposition").indexOf('=', 0) + 1);
                            link.innerHTML = 'Download Excel file';
                            link.download = `${fileName}.xlsx`;
                            link.href = 'data:application/octet-stream;base64,' + b64encoded;
                            link.click();
                            that.closeBusyDialog();
                            that.showMessage(that.resourceBundle.getText("reportDownloadedSuccessfully"));
                        },
                        function (responseData) {
                            that.closeBusyDialog();
                            that.showMessage(that.resourceBundle.getText("downloadFailed"));
                        });
                });
            },
            /******************* Filter Bar ***************************/
            // fnLoadRequestDetails: function () {
            //     let that = this,
            //         MassRequest = this.getModelDetails("MassRequest"),
            //         rowsPerPage = MassRequest.getProperty("/PaginationDetails/rowsPerPage"),
            //         filterPayload = {
            //             "requestNumber": null,
            //             "requestTypeId": null,
            //             "requestDescription": null,
            //             "requestStatusId": null,
            //             "createdOn": null,
            //             "dateRequired": null,
            //             "page": 0,
            //             "size": rowsPerPage,
            //             "requestSource": ["Mass_Request"]
            //         };
            //     that._fnTriggerSearch(filterPayload);
            // },
            //Clear Action Button
            onClearFilterData: function () {
                let MassRequest = this.getModelDetails("MassRequest"),
                    MassRequestLocalModel = this.getView().getModel("MassRequestLocalModel"),
                    MassRequestLocalModelData = MassRequestLocalModel.getData();

                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });                   //To set the colour of selected page in pagination tray

                MassRequest.setProperty("/PaginationDetails", MassRequestLocalModelData.PaginationDetails);
                MassRequest.setProperty("/RequestDetailList", MassRequestLocalModelData.RequestDetailList);
                MassRequest.setProperty("/PaginationDetails/currentPage", 1);           //To go to page 1 whenever user clicks on Search button
                MassRequest.setProperty("/PaginationDetails/trayDetails/start", 1)      //To set the pagination tray start to 1 whenever user clicks on Search button
                MassRequest.setProperty("/FilterDetails", {});
                this._fnGetFilteredData();
            },
            //Search Action Button
            onSearchData: function () {
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                let MassRequest = this.getModelDetails("MassRequest");
                MassRequest.setProperty("/PaginationDetails/currentPage", 1);
                MassRequest.setProperty("/PaginationDetails/trayDetails/start", 1)
                this._fnGetFilteredData();
            },
            //Create Payload : Filter
            _fnGetFilteredData: function () {
                let MassRequest = this.getModelDetails("MassRequest"),
                    filterData = MassRequest.getProperty("/FilterDetails"),
                    currentPage = MassRequest.getProperty("/PaginationDetails/currentPage") - 1,
                    rowsPerPage = MassRequest.getProperty("/PaginationDetails/rowsPerPage"),
                    filterPayload = {},
                    requestCreationDateRange = filterData.requestCreationDateRange || "",
                    // requestRequiredDateRange = filterData.requestRequiredDateRange || "",
                    priority = filterData.priority || false,
                    that = this;
                filterPayload =
                {
                    "basicSearch": {
                    "createdBy": this.onGetNullValue(filterData.createdBy, "string"),
                    "requestNumber": this.onGetNullValue(filterData.massRequestID, "string"),
                    "requestTypeId": this.onGetNullValue(filterData.key_requestType, "int"),
                    "requestDescription": this.onGetNullValue(filterData.massRequestDesc, "string"),
                    "requestStatusId": this.onGetNullValue(filterData.key_requestStatus, "int"),
                    "createdOn": this.onGetNullValue(requestCreationDateRange, "string"),
                    "materialTypeId": this.onGetNullValue(filterData.materialType, "int"),
                    // "dateRequired": this.onGetNullValue(requestRequiredDateRange, "string"),
                    "priority": priority,
                    "requestSource": ["Mass_Request"]
                    },
                    "page": currentPage,
                    "size": rowsPerPage,
                    "advancedSearch": null
                }

                for (const key in filterPayload["basicSearch"]) {
                    if (typeof (filterPayload["basicSearch"][key]) === "string") {
                        filterPayload["basicSearch"][key] = this.onTrim(filterPayload["basicSearch"][key]);
                    }
                }
                this.onSetTimeOut(1000).then(() => {
                    that._fnTriggerSearch(filterPayload);
                });
            },
            //fn: Call search service.
            _fnTriggerSearch: function (filterPayload) {
                let MassRequest = this.getModelDetails("MassRequest"),
                    that = this;    
                this.fnProcessDataRequest("MM_JAVA_MASS/searchDynamicRequestHeaderData", "POST", null, true, filterPayload,
                    function (responseData) {
                        if (responseData.result) {
                            MassRequest.setProperty("/RequestDetailList", responseData.result.mmRequestHeaderDtoList);
                            MassRequest.setProperty("/PaginationDetails/totalrecords", responseData.result.totalCount);
                            MassRequest.setProperty("/PaginationDetails/totalPages", responseData.result.totalPages);
                            that.pagination();

                            MassRequest.setProperty("/PaginationDetails/footerVisible", true);
                            if (responseData.result?.totalPages === 0) {
                                MassRequest.setProperty("/PaginationDetails/footerVisible", false);
                            }
                        }
                        that.closeBusyDialog();
                    },
                    function (responseData) {
                        MassRequest.setProperty("/PaginationDetails/footerVisible", false);
                        that.closeBusyDialog();
                    }
                );
            },
            /*----------END : Filter-----------------------*/

            /**************************PAGINATION*******************/
            onSetPaginationTrayText: function () {
                var MassRequest = this.getModelDetails("MassRequest"),
                    paginationTrayStart = MassRequest.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd = MassRequest.getProperty("/PaginationDetails/trayDetails/end"),
                    totalPagesArray = [],
                    totalPages = MassRequest.getProperty("/PaginationDetails/totalPages");

                if (paginationTrayStart + 4 <= totalPages) {                  //Condition to set the pagination tray end according to number of total pages
                    paginationTrayEnd = paginationTrayStart + 4;
                    MassRequest.setProperty("/PaginationDetails/trayDetails/end", paginationTrayStart + 4);
                }
                else {
                    paginationTrayEnd = totalPages;
                    MassRequest.setProperty("/PaginationDetails/trayDetails/end", totalPages);
                }

                for (let page = paginationTrayStart; page <= paginationTrayEnd; page++) {
                    totalPagesArray.push({ "page": page });
                }
                MassRequest.setProperty("/PaginationDetails/totalPagesArray", totalPagesArray);
            },

            pagination: function () {
                var MassRequest = this.getModelDetails("MassRequest"),
                    totalPages = MassRequest.getProperty("/PaginationDetails/totalPages");
                if (totalPages <= 5) {
                    MassRequest.setProperty("/PaginationDetails/trayDetails/end", totalPages);
                }
                this.onSetPaginationTrayText();

                //For addding MM_ActivePaginationLinkColor to link of page 1 when loading the screen.
                var currentPage = MassRequest.getProperty("/PaginationDetails/currentPage");
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
                var MassRequest = this.getModelDetails("MassRequest"),
                    selectedPage = oEvent.getSource().getText();
                MassRequest.setProperty("/PaginationDetails/currentPage", parseInt(selectedPage));
                oEvent.getSource().removeStyleClass("MM_PaginationLinkColor");
                oEvent.getSource().addStyleClass("MM_ActivePaginationLinkColor");
                this._fnGetFilteredData();
            },

            onNextPage: function () {
                var MassRequest = this.getModelDetails("MassRequest"),
                    currentPage = MassRequest.getProperty("/PaginationDetails/currentPage"),
                    paginationTrayStart = MassRequest.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd = MassRequest.getProperty("/PaginationDetails/trayDetails/end");
                if (currentPage === paginationTrayEnd) {
                    MassRequest.setProperty("/PaginationDetails/trayDetails/start", paginationTrayStart + 1);
                    MassRequest.setProperty("/PaginationDetails/trayDetails/end", paginationTrayEnd + 1);
                    this.onSetPaginationTrayText();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                MassRequest.setProperty("/PaginationDetails/currentPage", currentPage + 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage + 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this._fnGetFilteredData();
            },

            onPrevPage: function () {
                var MassRequest = this.getModelDetails("MassRequest"),
                    currentPage = MassRequest.getProperty("/PaginationDetails/currentPage"),
                    paginationTrayStart = MassRequest.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd = MassRequest.getProperty("/PaginationDetails/trayDetails/end");
                if (currentPage === paginationTrayStart) {
                    MassRequest.setProperty("/PaginationDetails/trayDetails/start", paginationTrayStart - 1);
                    MassRequest.setProperty("/PaginationDetails/trayDetails/end", paginationTrayEnd - 1);
                    this.onSetPaginationTrayText();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                MassRequest.setProperty("/PaginationDetails/currentPage", currentPage - 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage - 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this._fnGetFilteredData();
            },

            onSelectPageSize: function (oEvent) {
                var rowsPerPage = parseInt(oEvent.getSource().getSelectedItem().mProperties.text),
                    MassRequest = this.getModelDetails("MassRequest");
                //Just to remove the previous selection in css
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                MassRequest.setProperty("/PaginationDetails/rowsPerPage", rowsPerPage);
                MassRequest.setProperty("/PaginationDetails/selectRowsPerPage", rowsPerPage);
                MassRequest.setProperty("/PaginationDetails/currentPage", 1);
                MassRequest.setProperty("/PaginationDetails/trayDetails/start", 1);
                MassRequest.setProperty("/PaginationDetails/trayDetails/end", 5);
                this._fnGetFilteredData();
            }
        });
    });
