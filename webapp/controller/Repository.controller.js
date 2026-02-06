sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/viatris/materialmaster/controller/BaseController",
    "com/viatris/materialmaster/model/formatter",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, BaseController, formatter, JSONModel) {
        "use strict";

        return BaseController.extend("com.viatris.materialmaster.controller.Repository", {
            formatter: formatter,
            gViewName: "Repository",
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("MassRequest").attachPatternMatched(this.onBeforeRouteMatched, this);
                this._onRouteMatched();
                this.oRouter.getRoute("Repository").attachPatternMatched(this._onRouteMatched, this);
                this.resourceBundle = this.getModelDetails("i18n").getResourceBundle();
                this.onGetRepositoryDetails();
                this.onLoadingMaterialStatusForRepo();
                this.onLoadRepoRulesData();
                this.onLoadingBaseUomData();
                // this._readFilterDropdownFields();
            },

            onBeforeRouteMatched: function (oEvent) {
                let oAppModel = this.getModelDetails("oAppModel"),
                    userRole = oAppModel.getProperty("/userdetails/userRole");

                // Prevent routing
                if (!(userRole?.includes("Repository Display") || userRole?.includes("Repository Edit"))) {
                    // Prevent routing
                    this.navigateTo("NotFoundPage");
                }
            },

            _onRouteMatched: async function (oEvent) {
                var oAppModel = this.getModelDetails("oAppModel"),
                    Repository = this.getModelDetails("Repository"),
                    actionFor = "repo_view",
                    selectedPath = Repository.getProperty("/MaterialSelected/selectedPath"),
                    isExtendorModify = Repository.getProperty("/MaterialSelected/repoSubmitFor") || null;
                oAppModel.setProperty("/sideNavigation/icon/Repository", "sap-icon://master-task-triangle-2");
                oAppModel.setProperty("/sideNavigation/setSelectedKey", "PageRepository");
                oAppModel.setProperty("/sideNavigation/currentView", "Repository");

                if (selectedPath && (isExtendorModify != "Modify" && isExtendorModify != "Extend")) {
                    let selectedIndex = parseInt(selectedPath.split('/').pop(), 10);
                    this.fnLoadRepoMaterialDetails(actionFor, selectedPath, selectedIndex);
                }
            },

            _readFilterDropdownFields: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    that = this;
                // RepositoryModel = this.getModelDetails("Repository");

                this.fnProcessDataRequest("MM_JAVA/getAllFieldNamesDropdown", "GET", null, true, null,
                    function (responseData) {
                        if (responseData) {
                            LookupModel.setProperty("/Repository/AdvSearchFieldsList", responseData);
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
                return "Repository";
            },

            getRequestSource: function () {
                return "Repository";
            },

            onLoadRepoRulesData: function () {
                return new Promise(async (resolve) => {
                    let that = this,
                        lookupModel = this.getModelDetails("LookupModel");
                    var rulePayload = lookupModel.getProperty("/repositorySearchRulesList");

                    if (rulePayload) {
                        for (let list of rulePayload) {
                            let url = "MM_WORKRULE/rest/v1/invoke-rules",
                                result = null, resultData = null,
                                sPath = "/" + list.modelPath,
                                requestPayload = that.onGetRulePayload(list.tableName, list.conditions, list.systemOrders, list.systemFilters);
                            this.fnProcessDataRequest(url, "POST", null, false, requestPayload,
                                function (responseData) {
                                    result = responseData?.data?.result;
                                    resultData = null;
                                    try {
                                        let resultSet = result[0];
                                        resultData = resultSet[list.tableName];
                                    }
                                    catch (e) { }
                                    if (list.tableName !== "MM_REQUEST_TYPE_REF_LIST") {
                                        lookupModel.setProperty(sPath, resultData);
                                    }
                                },
                                function (responseData) {
                                    lookupModel.setProperty(sPath, resultData);
                                });
                        }
                    }
                    resolve(true);
                });
            },


            onGetActiveAttributeChanges: function () {
                let that = this,
                    sUrl = "MM_JAVA/getOnGoingAttributeChanges",
                    Repository = this.getModelDetails("Repository"),
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    payload = {
                        "attributeId": null,
                        "systemId": null,
                        "uiView": null,
                        "readPlantData": true,
                        "readAttributeData": true,
                        "requestNumber": null,
                        "materialNumber": materialNumber
                    };
                this.fnProcessDataRequest(sUrl, "POST", null, true, payload,
                    function (responseData) {
                        MaterialDetails.setProperty("/materialChangeHistory/activeAttibuteChanges", responseData?.response);
                        that.closeBusyDialog();
                    },
                    function (error) {
                        that.closeBusyDialog();
                    }
                );
            },

            onClickViewBasicData: async function (oEvent) {
                let systemId = oEvent.getSource().getBindingContext("MaterialDetails").getObject().MM_SYSTEM_ID,
                    repositorySystemStatusId = oEvent.getSource().getBindingContext("MaterialDetails").getObject().repositorySystemStatusId,
                    repository = this.getModelDetails("Repository"),
                    materialType = repository.getProperty("/MaterialSelected/materialTypeId"),
                    requestManagement = this.getModelDetails("RequestManagement"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedSystems = MaterialDetails.getProperty(`/SystemData/selectedSystems`);

                selectedSystems?.map(item => {
                    if (item?.MM_SYSTEM_ID == systemId) {
                        MaterialDetails.setProperty("/SystemData/repositorySystemStatusId", item?.repositorySystemStatusId);
                    }
                });

                this.handleSystemDropdown(systemId);
                requestManagement.setProperty("/source", "repository");
                this.fnHandleClassListDropdown(systemId);
                this.fnToRenderOdataLookup(systemId);
                await this.fnToRenderRulesLookup(materialType, systemId);
                this.oRouter.navTo("SystemDetails", { targetSystem: systemId });
                this.fnToLoadSystemDetails(systemId, repositorySystemStatusId);
                this.fnUpdateAltUomDataMaterialAdd(systemId);
            },

            onLoadLocalSelectedMaterialData: async function () {
                let that = this;
                if (!that.getView().getModel("RepositoryDetailsLocalModel")) {
                    let RepositoryDetailsLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/Repository.json"),
                        RepositoryDetailsLocalModel = new JSONModel();
                    that.getView().setModel(RepositoryDetailsLocalModel, "RepositoryDetailsLocalModel");
                    await RepositoryDetailsLocalModel.loadData(RepositoryDetailsLocation);
                }
                return (that.getView().getModel("RepositoryDetailsLocalModel").getData()?.MaterialSelected);
            },

            // To Edit the Repo Details
            fnEditRepoDetails: function (oEvent) {
                let that = this,
                    Repository = this.getModelDetails("Repository"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    systemData = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber"),
                    promiseArray = [], p1, p2, p3;
                Repository.setProperty("/MaterialSelected/repoSubmitFor", "Modify");

                Repository.setProperty("/MaterialSelected/documentEditability", true); //792 ticket

                p1 = that.handleEditabilityforProductData("Repository");
                promiseArray.push(p1);
                p2 = that.handleEditabilityforOrgData("Repository");
                promiseArray.push(p2);
                p3 = that.fnSetSystemProperties(null, materialNumber, that.gViewName);
                promiseArray.push(p3);
                Promise.all(promiseArray).then(() => {
                    that.closeBusyDialog();
                }).catch(error => {
                    console.log("An Error Occured!")
                });
                systemData?.map(item => {
                    item.isIncluded = true;
                    if (item?.repositorySystemStatusId == 10 || item?.repositorySystemStatusId == 11){
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${item?.MM_SYSTEM_ID}/basicData1`, {});
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${item?.MM_SYSTEM_ID}/basicData2`, {});
                    }
                })
                Repository.setProperty("/MaterialSelected/showRepoFooterActions", true);
                MaterialDetails.setProperty("/OrganizationalData/buttonVisibility/editPlant", false);
            },

            //To Extend from Repository
            fnExtendRepoDetails: function () {
                let that = this,
                    Repository = this.getModelDetails("Repository"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    systemData = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber"),
                    promiseArray = [],
                    defaultServiceTriggered = false, p1;
                Repository.setProperty("/MaterialSelected/repoSubmitFor", "Extend");
                Repository.setProperty("/MaterialSelected/documentEditability", true); // 792 ticket

                systemData?.map(async item => {
                    if (item.repositorySystemStatusId == "10" || item.repositorySystemStatusId == "11") {
                        item.isIncluded = true;
                        if(!defaultServiceTriggered){
                            p1 = await that.fnSetSystemProperties(null, materialNumber, that.gViewName);
                            defaultServiceTriggered = true;
                            promiseArray.push(p1);
                            Promise.all(promiseArray).then(() => {
                                that.closeBusyDialog();
                            }).catch(error => {
                                console.log("An Error Occured!")
                            });
                        }
                        this.fnToLoadSystemDetails(item?.MM_SYSTEM_ID, item?.repositorySystemStatusId);
                    }
                });
                Repository.setProperty("/MaterialSelected/showRepoFooterActions", true);
                MaterialDetails.setProperty("/OrganizationalData/buttonVisibility/addPlant", true);
                MaterialDetails.setProperty("/SystemData/buttonVisibility/addSystem", true);
                MaterialDetails.setProperty("/OrganizationalData/buttonVisibility/editPlant", true);
                MaterialDetails.setProperty("/OrganizationalData/buttonVisibility/deletePlant", true);
            },
            onClickRepoSubmitBtn: function(){
                this.debouncedButtonTimer(this._executeRepoSubmit, "submit_repo");
            },
            _executeRepoSubmit:async function () {
                let that = this,
                    oView = this.getView(),
                    Repository = this.getModelDetails("Repository"),
                    repoSubmitFor = Repository.getProperty("/MaterialSelected/repoSubmitFor"),
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber"),
                    isSyndicatedVal = false, url;

                if (repoSubmitFor === "Modify") {
                    url = "MM_JAVA/getWfContextValidationRepoModify"
                }
                else if (repoSubmitFor === "Extend") {
                    url = "MM_JAVA/getWfContextValidationRepoExtend"
                }

                const isValid = await this.onSaveMaterialList();
                if(!isValid){
                    return;
                }

                let matDetailsPayload = this.fnFrameMaterialDetailsOldNewDto("Validate");
                Repository.setProperty("/syndicateParallelRequestResponses", []);
                Repository.setProperty("/wfParallelRequestResponses", []);

                this.fnProcessDataRequest(url, "POST", null, true, matDetailsPayload,
                    async function (responseData) {
                        if (responseData?.responseStatus == 200) {
                            let approvalReq = responseData?.approvalReq,
                                requestNumbersForDirectSyndication = responseData?.requestNumbersForDirectSyndication,
                                plantCodesForDirectSyndication = responseData?.plantCodesForDirectSyndication,
                                parentReqDetailsRepo = {
                                    parentRequestNo: responseData?.parentReqFromRepo,
                                    parentMaterialistId: responseData?.parentMaterialistId
                                };
                            if (requestNumbersForDirectSyndication && requestNumbersForDirectSyndication?.length > 0 && repoSubmitFor === "Modify") {
                                for (let request of requestNumbersForDirectSyndication) {
                                    isSyndicatedVal = await that.fnToSyndicate(parentReqDetailsRepo, true, request, false, false);
                                    if (isSyndicatedVal) {
                                        await that.fnToSyndicate(parentReqDetailsRepo, false, request, false, false);
                                    }
                                }
                            }
                            if (plantCodesForDirectSyndication && plantCodesForDirectSyndication?.length > 0 && repoSubmitFor === "Extend") {
                                isSyndicatedVal = await that.fnToSyndicate(parentReqDetailsRepo, true, null, false, true, plantCodesForDirectSyndication);
                                if (isSyndicatedVal) {
                                    await that.fnToSyndicate(parentReqDetailsRepo, false, null, false, true, plantCodesForDirectSyndication);
                                }
                            }
                            if (approvalReq || repoSubmitFor === "Extend") {
                                that.fnhandleWorkflowForParallelRequests(responseData, "Repository");
                            }
                            let displayMsg = that.geti18nText("parentReqInfoRepo") + parentReqDetailsRepo?.parentRequestNo,
                                syndicationMsgs = Repository.getProperty("/syndicateParallelRequestResponses"),
                                wfTriggeredInfo = Repository.getProperty("/wfParallelRequestResponses"),
                                actions = ["OK"];
                            that.showMessage(displayMsg, "S", actions, "OK", function (action) {
                                if (syndicationMsgs.length > 0) {
                                    that.LoadFragment("SyndicationInfoRepo", oView, true);
                                }
                                if (((approvalReq && !(requestNumbersForDirectSyndication.length > 0) && repoSubmitFor === "Modify") || ((!(plantCodesForDirectSyndication?.length > 0) || !(syndicationMsgs.length > 0)) && (wfTriggeredInfo?.length > 0) && repoSubmitFor === "Extend"))) {
                                    that.LoadFragment("WfTriggeredInfoRepo", oView, true);
                                }
                            });
                            await that.onReloadMaterialDetailJSON("Repository").then(function () {
                            });
                            await that.fnGetRepositoryDataOnMaterialNumberJAVA(materialNumber);
                            await that.fnLoadSAPDataMaterialNo(materialNumber);
                            that.onGetFilteredDataMatChangeLog("Repository", true);
                            that.onGetActiveAttributeChanges();
                            Repository.setProperty("/MaterialSelected/showRepoFooterActions", false);
                            Repository.setProperty("/MaterialSelected/repoSubmitFor", "");
                            Repository.setProperty("/MaterialSelected/documentEditability", false); // 792 ticket
                            that.closeBusyDialog();
                        }
                        else {
                            let errMsg = responseData?.errorMessage[0];
                            that.showMessage(errMsg, "E", ["OK"], "OK", function () {
                            });
                            that.closeBusyDialog();
                        }
                    },
                    function (oError) {
                        that.closeBusyDialog();
                    }
                );
            },

            onOkSyndicationInfoRepo: function () {
                let oView = this.getView(),
                    Repository = this.getModelDetails("Repository"),
                    wfTriggeredInfo = Repository.getProperty("/wfParallelRequestResponses");
                this.getView().byId("id_SyndicationInfoRepo").close();
                if (wfTriggeredInfo && wfTriggeredInfo?.length > 0) {
                    this.LoadFragment("WfTriggeredInfoRepo", oView, true);
                }
            },

            onOkWfTriggeredInfoRepo: function () {
                this.getView().byId("id_WfTriggeredInfoRepo").close();
            },

            onClickRepoCancelBtn: function () {
                let Repository = this.getModelDetails("Repository"),
                    selectedPath = Repository.getProperty("/MaterialSelected/selectedPath"),
                    actionFor = "repo_view",
                    selectedIndex = parseInt(selectedPath.split('/').pop(), 10);

                this.fnLoadRepoMaterialDetails(actionFor, selectedPath, selectedIndex);

                Repository.setProperty("/MaterialSelected/showRepoFooterActions", false);
                Repository.setProperty("/MaterialSelected/repoSubmitFor", "");
                Repository.setProperty("/MaterialSelected/documentEditability", false); // 792 ticket
            },

            fnEditRepoDocument: function () {
                let Repository = this.getModelDetails("Repository");
                Repository.setProperty("/MaterialSelected/repoSubmitFor", "EditDocument");
                Repository.setProperty("/MaterialSelected/showRepoFooterActions", false);
                Repository.setProperty("/MaterialSelected/documentEditability", true);
            },

            // Onclick of Material List Item in Repository
            onClickRepoMaterialListitem: async function (oEvent) {

                // let selectedRowIndex = oEvent.getParameters().rowIndex;
                // oEvent.getSource().setSelectedIndex(selectedRowIndex);

                let Repository = this.getModelDetails("Repository"),
                    selectedMaterialDetailsTab = Repository.getProperty("/MaterialSelected/selectedMaterialDetailsTab"),
                    selectedRowIndex = oEvent?.getParameters()?.rowIndex,
                    prevSelectedIndex = Repository?.getProperty("/MaterialSelected/selectedIndex"),
                    selectedPath = oEvent && oEvent.getParameter("rowContext")?.sPath,
                    selectedMatType = Repository.getProperty(selectedPath)?.materialTypeId,
                    selectedIndex = null,
                    oTable = this?.byId("repositoryTableId"),
                    actionFor = "repo_view";

                // if(selectedRowIndex == prevSelectedIndex){
                //     oEvent?.getSource()?.setSelectedIndex(selectedRowIndex);
                //     return;
                // }

                if (selectedMaterialDetailsTab == "MaterialChangeHistory") {
                    this.onGetFilteredDataMatChangeLog("Repository", true);
                    this.onGetActiveAttributeChanges();
                }

                Repository.setProperty("/MaterialSelected/repoSubmitFor", "");
                if (selectedPath !== undefined) {
                    selectedIndex = parseInt(selectedPath.split('/').pop(), 10);
                } else {    //trigger the fire selection method to refresh page.
                    selectedIndex = oEvent && oEvent.getSource().getSelectedIndices()[0];
                }
                if (selectedMatType && !Repository.getProperty(`/GeneralData/attributeListProdData/${selectedMatType}`)) {
                    await this.onGetAllFieldNamesProductData(selectedMatType);
                }
                this.fnLoadRepoMaterialDetails(actionFor, selectedPath, selectedIndex);
                this.fnToDisableUiTableSelectedRow(oTable, selectedRowIndex);
            },

            onGetAllFieldNamesProductData: function (selectedMatType) {
                return new Promise(async (resolve) => {
                    let that = this,
                        Repository = this.getModelDetails("Repository"),
                        LookupModel = this.getModelDetails("LookupModel"),
                        sUrl = "MM_JAVA/getAttributesList",
                        oPayload = {
                            "materialTypeId": selectedMatType,
                            "uiView": "Product_Data",
                            "requestSource": "Repository"
                        };
                    this.fnProcessDataRequest(sUrl, "POST", null, true, oPayload,
                        function (responseData) {
                            Repository.setProperty(`/GeneralData/attributeListProdData/${selectedMatType}`, responseData?.attributeList);
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

            fnLoadRepoMaterialDetails: async function (actionFor, selectedPath, selectedIndex) {
                var Repository = this.getModelDetails("Repository"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentUserRole = oAppModel.getProperty("/userdetails/userRole"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    productDataOutline = null,
                    viewName = this.getViewName(),
                    selectedmaterialData = Repository.getProperty("/MaterialsList")[selectedIndex],
                    materialNumber = selectedmaterialData?.materialNumber,
                    that = this,
                    materialScenarioDetails = {},
                    materialSelectedTmpl = this.onLoadLocalSelectedMaterialData(),
                    selectedMaterialDetailsTab = Repository.getProperty("/MaterialSelected/selectedMaterialDetailsTab");
                that.openBusyDialog();
                materialScenarioDetails = {
                    "selectedMaterialDetailsTab": selectedMaterialDetailsTab,
                    "selectedPath": selectedPath,
                    "selectedIndex": selectedIndex,
                    "isMaterialDetailsVisible": true,
                    "showRepoFooterActions": false
                };
                materialSelectedTmpl = { ...materialSelectedTmpl, ...materialScenarioDetails };
                selectedmaterialData = { ...selectedmaterialData, ...materialSelectedTmpl };
                Repository.setProperty("/MaterialSelected", selectedmaterialData);
                //No Outline exist or if it is an empty json
                if (!productDataOutline || Object.keys(productDataOutline)?.length === 0) {
                    await that.onReloadMaterialDetailJSON(viewName).then(async function () {
                        await that.fnToLoadProductDataOutline(viewName).then(function () {
                            // that.fnRemoveClassificationClassAttributes();
                        });
                    });
                }
                else {
                    await that.onReloadMaterialDetailJSON(viewName).then(function () {
                    })
                }
                if (materialNumber) {
                    //Get Repository Data From Java DB
                    await this.fnGetRepositoryDataOnMaterialNumberJAVA(materialNumber);
                    //Get Repository Data From SAP DB
                    await this.fnLoadSAPDataMaterialNo(materialNumber);
                }

                if (selectedMaterialDetailsTab == "docsComments" && materialNumber) {
                    this.fnGetCommentsByMaterialNumber(materialNumber, "Repository");
                    MaterialDetails.setProperty("/DocComments/docsCommentsFlagRepository", true);

                    this.fnGetRepositoryDocumentsByMaterialNumber(materialNumber, "Repository");

                }

                // p1 = this.handleEditabilityforProductData(viewName);
                // promiseArray.push(p1);
                // p2 = this.handleEditabilityforOrgData(viewName);
                // promiseArray.push(p2);
                // Promise.all(promiseArray).then(() => {
                //     that.closeBusyDialog();
                // }).catch(error => {
                //     console.log("An Error Occured!")
                // });
                // that.onGetFilteredDataMatChangeLog("Repository", true);
                // that.onGetActiveAttributeChanges();
            },

            onMaterialDetailsTabSelection: function (oEvent) {
                var SelectedTabKey = oEvent.getParameter("key"),
                    Repository = this.getModelDetails("Repository"),
                    MaterialDetails = this.getModelDetails("MaterialDetails");
                Repository.setProperty("/MaterialSelected/selectedMaterialDetailsTab", SelectedTabKey)
                if (SelectedTabKey === "docsComments") {
                    var materialNumber = Repository.getProperty("/MaterialSelected/materialNumber"),
                        docsCommentsFlagRepository = MaterialDetails.getProperty("/DocComments/docsCommentsFlagRepository");
                    if (materialNumber && !docsCommentsFlagRepository) {
                        // this.onGetAttachmentByRequestNumber(null, materialNumber, "Repository");
                        this.fnGetCommentsByMaterialNumber(materialNumber, "Repository");


                    }
                    //getDocumentsFromMaterialNumber
                    this.fnGetRepositoryDocumentsByMaterialNumber(materialNumber);

                    MaterialDetails.setProperty("/DocComments/docsCommentsFlagRepository", true)
                }
                else if (SelectedTabKey == "MaterialChangeHistory") {
                    this.onGetFilteredDataMatChangeLog("Repository", true);
                    this.onGetActiveAttributeChanges();
                }
            },

            // fnGetRepositoryDocumentsByMaterialNumber: function(materialNumber){
            //     var that=this,
            //     docCommentModel = this.getView().getModel("docCommentModel");

            //     if (!docCommentModel) {
            //         docCommentModel = new JSONModel();
            //         this.getView().setModel(docCommentModel, "docCommentModel");
            //     }

            //     this.fnProcessDataRequest(`MM_JAVA/getDocumentsByMaterialNumber?materialNumber=${materialNumber}`, "GET", null, true, null, function (responseData) {
            //         if (responseData) {

            //             docCommentModel.setProperty("/documents/existingDoc",responseData.response);
            //             docCommentModel.setProperty("/documents/attachmentcount", responseData?.response?.length);
            //             that.closeBusyDialog();
            //         }
            //     },
            //         function (responseData) {
            //             that.closeBusyDialog();
            //         });
            // },

            onGetRepositoryDetails: function () {
                let filterPayload = {
                    "basicSearch": {
                        "materialNumber": null,
                        "materialDescription": null,
                        "materialTypeId": null,
                        "materialStatusId": null
                    },
                    "advancedSearch": [],
                    "page": 0,
                    "size": 10
                };
                this.onTriggerSearch(filterPayload);
            },

            //Audit Log Download
            onOpenDownloadAuditLog: function () {
                let oView = this.getView(),
                    that = this,
                    Repository = this.getModelDetails("Repository"),
                    updatedByHelpSet = Repository.getProperty("/RepoAuditLogDownload/updatedByHelpSet"),
                    fieldNameHelpSet = Repository.getProperty("/RepoAuditLogDownload/fieldNameHelpSet");
                this.LoadFragment("Repo_Audit_Log_Download", oView, true);
                if (updatedByHelpSet.length === 0) {
                    this.fnProcessDataRequest("MM_JAVA_MASS/distinctChangedBy", "GET", null, true, null, function (responseData) {
                        if (responseData) {
                            Repository.setProperty("/RepoAuditLogDownload/updatedByHelpSet", responseData);
                            that.closeBusyDialog();
                        }
                    },
                        function (responseData) {
                            that.closeBusyDialog();
                        });
                }
                if (!fieldNameHelpSet || fieldNameHelpSet?.length === 0) {
                    that.onGetAllFieldNamesAuditLog();
                }
            },

            onGetAllFieldNamesAuditLog: function () {
                let that = this,
                    Repository = this.getModelDetails("Repository"),
                    sUrl = "MM_JAVA/getAttributesList",
                    oPayload = {
                        "materialTypeId": null,
                        "uiView": "*",
                        "requestSource": "*"
                    };

                this.fnProcessDataRequest(sUrl, "POST", null, true, oPayload,
                    function (responseData) {
                        responseData?.attributeList.sort((a, b) => {
                            let textA = formatter.changeFilterTextValue.call(that, a.attribute_value)?.toLowerCase();
                            let textB = formatter.changeFilterTextValue.call(that, b.attribute_value)?.toLowerCase();
                            return textA.localeCompare(textB);
                        });
                        Repository.setProperty("/RepoAuditLogDownload/fieldNameHelpSet", responseData?.attributeList);
                        that.closeBusyDialog();
                    },
                    function (error) {
                        that.closeBusyDialog();
                    }
                );
            },

            onClearAuditLog: function () {
                let Repository = this.getModelDetails("Repository"),
                    downloadParams = {
                        "fieldName": "",
                        "materialNumber": [],
                        "newValue": "",
                        "oldValue": "",
                        "requestNumber": null,
                        "updatedById": "",
                        "updatedOn": ""
                    }
                Repository.setProperty("/RepoAuditLogDownload/downloadParams", downloadParams);
                this.byId("id_MultiInputMatNo").removeAllTokens();
            },

            onCloseAuditLogDownload: function () {
                let Repository = this.getModelDetails("Repository"),
                    downloadParams = {
                        "fieldName": "",
                        "materialNumber": [],
                        "newValue": "",
                        "oldValue": "",
                        "requestNumber": null,
                        "updatedById": "",
                        "updatedOn": ""
                    }
                Repository.setProperty("/RepoAuditLogDownload/downloadParams", downloadParams);
                this.byId("id_MultiInputMatNo").removeAllTokens();
                this.byId("id_Repo_DownloadAuditLog").close();
            },

            onDownloadAuditLog: function () {
                var that = this,
                    oMultiInput = this.getView().byId("id_MultiInputMatNo"),
                    Repository = this.getModelDetails("Repository"),
                    downloadParams = Repository.getProperty("/RepoAuditLogDownload/downloadParams"),
                    multiInputValue = oMultiInput.getValue();
                if (downloadParams?.fieldNameValue) {
                    let fieldNameArray = Repository.getProperty("/RepoAuditLogDownload/fieldNameHelpSet"),
                        isValidFieldName = fieldNameArray?.some(item => item?.attribute === downloadParams?.fieldName);
                    if (!isValidFieldName) {
                        let validFieldNameMsg = that.geti18nText("enterValidFieldName");
                        sap.m.MessageToast.show(validFieldNameMsg);
                        return;
                    }
                }
                if (multiInputValue) {
                    let validMatNoMsg = that.geti18nText("enterValidMaterialNo");
                    sap.m.MessageToast.show(validMatNoMsg);
                }
                else {
                    let that = this,
                        url = `MM_JAVA_MASS/downloadAuditLog`,
                        auditLogDownloadPayload = {
                            "fieldName": downloadParams?.fieldName || "",
                            "materialNumber": downloadParams?.materialNumber || [],
                            "newValue": downloadParams?.newValue || "",
                            "oldValue": downloadParams?.oldValue || "",
                            "requestNumber": parseInt(downloadParams?.requestNumber) || null,
                            "updatedById": downloadParams?.updatedById || "",
                            "updatedOn": downloadParams?.updatedOn || ""
                        }

                    this.fnProcessDataRequest(url, "POST", null, true, auditLogDownloadPayload,
                        function (responseData, responseHeader) {
                            let b64encoded = responseData.base64,
                                link = document.createElement('a'),
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
                }
            },

            onTokenUpdateMatNoAuditLog: function (oEvent) {
                let Repository = this.getModelDetails("Repository"),
                    selectedTokens = oEvent.getSource().getTokens(),
                    sType = oEvent.getParameter("type"),
                    removedTokens = oEvent.getParameter("removedTokens"),
                    selectedValues = [];

                if (selectedTokens) {
                    selectedValues = selectedTokens?.map(function (oToken) {
                        return parseInt(oToken.getKey());
                    });
                    if (sType === "removed" && removedTokens) {
                        let removedKey = removedTokens[0]?.getKey();
                        selectedValues = selectedValues.filter(function (value) {
                            return value != parseInt(removedKey)
                        })
                    }
                }
                Repository.setProperty("/RepoAuditLogDownload/downloadParams/materialNumber", selectedValues);
            },

            //Search Button Event - Advance Filter 
            onRepositoryAdvanceFilter: function () {
                this.byId("repositoryTableId").clearSelection();
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                let repositoryModel = this.getModelDetails("Repository");
                repositoryModel.setProperty("/PaginationDetails/currentPage", 1);
                repositoryModel.setProperty("/PaginationDetails/trayDetails/start", 1)
                this.onTriggerSearch();
                repositoryModel.setProperty("/MaterialSelected/isMaterialDetailsVisible", false);
                this.byId("id_Repo_AdvanceSearch")?.close();
            },

            onTriggerSearch: function () {
                let repositoryModel = this.getModelDetails("Repository"),
                    materialList = [],
                    that = this,
                    filterPayload = this.fnFormRepoAdvSearchPayload();

                this.fnProcessDataRequest("MM_JAVA/dynamicAdvancedSearchRepository", "POST", null, true, filterPayload, function (responseData) {
                    if (responseData.response) {
                        materialList = responseData?.response?.materialList || [];
                        repositoryModel.setProperty("/PaginationDetails/totalrecords", responseData?.response?.totalCount);
                        repositoryModel.setProperty("/PaginationDetails/totalPages", responseData?.response?.totalPages);
                        that.pagination();
                        that.closeBusyDialog();
                        repositoryModel.setProperty("/PaginationDetails/footerVisible", true);
                        if (responseData?.response?.totalPages === 0) {
                            repositoryModel.setProperty("/PaginationDetails/footerVisible", false);
                        }
                    } else {
                        sap.m.MessageBox.error(responseData.responseMessage);
                    }
                    repositoryModel.setProperty("/MaterialsList", materialList)

                },
                    function (responseData) {
                        that.closeBusyDialog();
                    });
            },

            fnFormRepoAdvSearchPayload: function () {
                let filterPayload = {}, fieldValue = "",
                    that = this,
                    repositoryModel = this.getModelDetails("Repository"),
                    lookupModel = this.getModelDetails("LookupModel"),
                    materialNumberList = [],
                    repoMaterialNumber = parseInt(repositoryModel.getProperty("/FilterOptions/BasicFilter/materialNumber")),
                    repoMaterialDescription = repositoryModel.getProperty("/FilterOptions/BasicFilter/materialDescription"),
                    repoMaterialType = repositoryModel.getProperty("/FilterOptions/BasicFilter/materialType"),
                    repoMaterialStatus = repositoryModel.getProperty("/FilterOptions/BasicFilter/status"),
                    repoLivery = repositoryModel.getProperty("/FilterOptions/BasicFilter/livery"),
                    repoMarketDestination = (repositoryModel.getProperty("/FilterOptions/BasicFilter/marketDestination")?.length === 0)
                        ? undefined
                        : repositoryModel.getProperty("/FilterOptions/BasicFilter/marketDestination"),
                    repoMolecule = repositoryModel.getProperty("/FilterOptions/BasicFilter/molecule"),
                    repoPlantId = repositoryModel.getProperty("/FilterOptions/BasicFilter/plant"),
                    repoStrength = repositoryModel.getProperty("/FilterOptions/BasicFilter/strength"),
                    advanceFilterTableData = repositoryModel.getProperty("/FilterOptions/AdvanceFilter"),
                    repoMarketDestinationInt = repoMarketDestination?.map(Number),
                    advancedSearch = advanceFilterTableData?.map((item, index) => (
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
                    ));
                if (repoMaterialNumber) materialNumberList.push(repoMaterialNumber);
                filterPayload = {
                    "basicSearch": {
                        "materialNumber": materialNumberList.length ? materialNumberList : null,
                        "materialDescription": this.onGetNullValue(repoMaterialDescription, "string") || null,
                        "materialTypeId": this.onGetNullValue(repoMaterialType, "int") || null,
                        "materialStatusId": this.onGetNullValue(repoMaterialStatus, "int") || null,
                        "livery": this.onGetNullValue(repoLivery, "int") || null,
                        "marketDestination": repoMarketDestinationInt || null,
                        "molecule": this.onGetNullValue(repoMolecule, "int") || null,
                        "plantId": this.onGetNullValue(repoPlantId, "string") || null,
                        "strength": this.onGetNullValue(repoStrength, "int") || null
                    },
                    "advancedSearch": advancedSearch,
                    "page": repositoryModel.getProperty("/PaginationDetails/currentPage") - 1,
                    "size": repositoryModel.getProperty("/PaginationDetails/rowsPerPage")
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

                return filterPayload;
            },

            onClearFilterData: function () {
                let RepositoryModel = this.getModelDetails("Repository");
                RepositoryModel.setProperty("/FilterOptions/BasicFilter", {});
                RepositoryModel.setProperty("/FilterOptions/AdvanceFilter", []);
                RepositoryModel.setProperty("/PaginationDetails/currentPage", 1);           //To go to page 1 whenever user clicks on Clear button
                RepositoryModel.setProperty("/PaginationDetails/trayDetails/start", 1)

                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });                   //To set the colour of selected page in pagination tray

                this.onTriggerSearch();
                this.byId("repositoryTableId").clearSelection();
                RepositoryModel.setProperty("/MaterialSelected/isMaterialDetailsVisible", false);
            },

            /****************Repository - Advance Filter*************************/
            //Advance Search Fragment - Open Dialog 
            onOpenDynamicSearch: function () {
                let oView = this.getView(),
                    RepositoryModel = this.getModelDetails("Repository");
                this.LoadFragment("Repo_AdvanceSearch", oView, true);
                // this.fnUpdateAvailableFieldsList();
            },

            //Update the filed list after selection.
            // fnUpdateAvailableFieldsList: function () {
            //     let RepositoryModel = this.getModelDetails("Repository"),
            //         LookupModel = this.getModelDetails("LookupModel"),
            //         allFilterFields = LookupModel.getProperty("/Repository/AdvSearchFieldsList"),
            //         //  allFilterFields = RepositoryModel.getProperty("/FilterOptions/All_FilterFields"),
            //         advanceFilterData = RepositoryModel.getProperty("/FilterOptions/AdvanceFilter");
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
            //     RepositoryModel.setProperty("/FilterOptions/Applicable_FilterFields", allFilterFields);
            //     RepositoryModel.refresh(true);
            // },

            //Add the advance filter line item
            onAddAdvanceFilterOption: function () {
                let RepositoryModel = this.getModelDetails("Repository"),
                    advanceFilterData = RepositoryModel.getProperty("/FilterOptions/AdvanceFilter"),
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
                RepositoryModel.setProperty("/FilterOptions/AdvanceFilter", advanceFilterData);
            },

            //Function - Delete the filter line item
            // onDeleteAFData: function (oEvent) {
            //     var RepositoryModel = this.getModelDetails("Repository"),
            //         selectedPath = oEvent.getSource().getBindingContext("Repository").sPath,
            //         listOfAllAFData = RepositoryModel.getProperty("/FilterOptions/AdvanceFilter");
            //     this._deleteSelectedRow(selectedPath, listOfAllAFData, "Repository");

            //     // this.fnUpdateAvailableFieldsList();
            // },

            onDeleteAFData: function (oEvent) {
                var RepositoryModel = this.getModelDetails("Repository"),
                    selectedPath = oEvent.getSource().getBindingContext("Repository").sPath,
                    listOfAllAFData = RepositoryModel.getProperty("/FilterOptions/AdvanceFilter"),
                    selectedIndex = parseInt(selectedPath.split("/").pop()); // extract index from path
            
                this._deleteSelectedRow(selectedIndex, listOfAllAFData, "Repository");
            },
            
            //Change function - combobox selection
            onChangeFieldSelection: function (oEvent) {
                var RepositoryModel = this.getModelDetails("Repository"),
                    oSource = oEvent.getSource();
                // this.fnHandleComboboxValidation(oEvent);
                //Table current line Item
                var oSelectedLineItem = oSource.getBindingContext("Repository").getObject();
                //Selected Item from combobox
                var oSelectedItem = oSource.getSelectedItem().getBindingContext("Repository").getObject();
                oSelectedLineItem.fieldNameFinal = oSelectedLineItem.fieldName;
                oSelectedLineItem.fieldKey = oSelectedLineItem.fieldKey;
                oSelectedLineItem.viewId = oSelectedLineItem.viewId;
                oSelectedLineItem.bFieldType = false;
                RepositoryModel.refresh(true);
                // this.fnUpdateAvailableFieldsList();
            },

            onChangeViewIdSelection: function(oEvent){
                this.debouncedButtonTimer(()=> this._executeChangeViewIdSelection(oEvent),"repo-adv-search", 2000);

            },
            _executeChangeViewIdSelection: function (oEvent) {
                var RepositoryModel = this.getModelDetails("Repository"),
                    oSource = oEvent.getSource(),
                    LookupModel = this.getModelDetails("LookupModel"),
                    RepoAdvViewIdList = LookupModel.getProperty("/RepositoryAdvFilter/viewList");
                // this.fnHandleComboboxValidation(oEvent);
                //Table current line Item
                var oSelectedLineItem = oSource.getBindingContext("Repository").getObject();
                //Selected Item from combobox
                var oSelectedItem = oSource.getSelectedItem().getBindingContext("Repository").getObject();
                oSelectedLineItem.viewIdFinal = oSelectedLineItem.viewId;
                oSelectedLineItem.viewIdForPayload = RepoAdvViewIdList?.find(item => item.key === oSelectedLineItem.viewId).viewId;
                // oSelectedLineItem.viewId = oSelectedItem.viewId;
                oSelectedLineItem.viewIdVisible = false;
                this.onSelectedViewIdType(oSource, "Repository");
            },

            //Close - Search Fragment
            onCloseDynamicSearch: function () {
                this.byId("id_Repo_AdvanceSearch").close();
            },

            //Pagination handled here :(

            onSetPaginationTrayText: function () {
                var Repository = this.getModelDetails("Repository"),
                    paginationTrayStart = Repository.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd,
                    totalPagesArray = [],
                    totalPages = Repository.getProperty("/PaginationDetails/totalPages");

                if (paginationTrayStart + 4 <= totalPages) {                  //Condition to set the pagination tray end according to number of total pages
                    paginationTrayEnd = paginationTrayStart + 4;
                    Repository.setProperty("/PaginationDetails/trayDetails/end", paginationTrayStart + 4);
                }
                else {
                    paginationTrayEnd = totalPages;
                    Repository.setProperty("/PaginationDetails/trayDetails/end", totalPages);
                }

                for (let page = paginationTrayStart; page <= paginationTrayEnd; page++) {
                    totalPagesArray.push({ "page": page });
                }
                Repository.setProperty("/PaginationDetails/totalPagesArray", totalPagesArray);
            },

            pagination: function () {
                var Repository = this.getModelDetails("Repository"),
                    totalPages = Repository.getProperty("/PaginationDetails/totalPages");
                var currentPage = Repository.getProperty("/PaginationDetails/currentPage");
                if (totalPages <= 5) {
                    Repository.setProperty("/PaginationDetails/trayDetails/end", totalPages);
                } else {
                    Repository.setProperty("/PaginationDetails/trayDetails/end", 5);
                }
                if (currentPage && currentPage > totalPages) {
                    Repository.setProperty("/PaginationDetails/currentPage", 1);
                    currentPage = 1;
                }
                this.onSetPaginationTrayText();

                //For addding MM_ActivePaginationLinkColor to link of page 1 when loading the screen.               
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
                var Repository = this.getModelDetails("Repository"),
                    selectedPage = oEvent.getSource().getText();
                Repository.setProperty("/PaginationDetails/currentPage", parseInt(selectedPage));
                oEvent.getSource().removeStyleClass("MM_PaginationLinkColor");
                oEvent.getSource().addStyleClass("MM_ActivePaginationLinkColor");
                this.onTriggerSearch();
            },

            onNextPage: function () {
                var Repository = this.getModelDetails("Repository"),
                    currentPage = Repository.getProperty("/PaginationDetails/currentPage"),
                    paginationTrayStart = Repository.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd = Repository.getProperty("/PaginationDetails/trayDetails/end");
                if (currentPage === paginationTrayEnd) {
                    Repository.setProperty("/PaginationDetails/trayDetails/start", paginationTrayStart + 1);
                    Repository.setProperty("/PaginationDetails/trayDetails/end", paginationTrayEnd + 1);
                    this.onSetPaginationTrayText();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                Repository.setProperty("/PaginationDetails/currentPage", currentPage + 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage + 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.onTriggerSearch();
            },

            onPrevPage: function () {
                var Repository = this.getModelDetails("Repository"),
                    currentPage = Repository.getProperty("/PaginationDetails/currentPage"),
                    paginationTrayStart = Repository.getProperty("/PaginationDetails/trayDetails/start"),
                    paginationTrayEnd = Repository.getProperty("/PaginationDetails/trayDetails/end");
                if (currentPage === paginationTrayStart) {
                    Repository.setProperty("/PaginationDetails/trayDetails/start", paginationTrayStart - 1);
                    Repository.setProperty("/PaginationDetails/trayDetails/end", paginationTrayEnd - 1);
                    this.onSetPaginationTrayText();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                Repository.setProperty("/PaginationDetails/currentPage", currentPage - 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage - 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.onTriggerSearch();
            },

            onSelectPageSize: function (oEvent) {
                var rowsPerPage = parseInt(oEvent.getSource().getSelectedItem().mProperties.text),
                    Repository = this.getModelDetails("Repository"),
                    repositoryTable = this.byId("repositoryTableId")
                //Just to remove the previous selection in css
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                //Clear selection from Repository material table and hide material details
                this.byId("repositoryTableId").clearSelection();
                Repository.setProperty("/MaterialSelected/isMaterialDetailsVisible", false);
                Repository.setProperty("/PaginationDetails/rowsPerPage", rowsPerPage);
                Repository.setProperty("/PaginationDetails/currentPage", 1);
                Repository.setProperty("/PaginationDetails/trayDetails/start", 1);
                Repository.setProperty("/PaginationDetails/trayDetails/end", 5);
                repositoryTable.setVisibleRowCount(rowsPerPage / 2);
                this.onTriggerSearch();
            },

            // Comments
            onPostComments: function (oEvent) {
                let oAppModel = this.getModelDetails("oAppModel"),
                    comments = oEvent.getParameter("value"),
                    Repository = this.getModelDetails("Repository"),
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber"),
                    loggedInUserDetails = oAppModel.getData().userdetails,
                    loggedInUserEmail = loggedInUserDetails.userMailID,
                    currdate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    taskInstanceId = oAppModel.getProperty("/taskDetails/taskId"),
                    that = this,
                    url = "MM_JAVA/saveMComments",
                    payload = {
                        "comment": comments,
                        "commentID": null,
                        "commentedBy": loggedInUserEmail,
                        "commentedOn": currdate,
                        "materialNumber": materialNumber,
                        "taskAction": null,
                        "taskInstanceId": taskInstanceId || null,
                        "taskName": wfTaskType || null
                    };
                this.fnProcessDataRequest(url, "POST", null, false, payload,
                    function (responsePayload) {
                        that.fnGetCommentsByMaterialNumber(materialNumber, "Repository");
                    },
                    function (responsePayload) { })
            },

            //Download Repository Data
            onPressDownloadRqpositoryData: function (oEvent) {
                this.LoadFragment("Repository_DownloadData", this.getView(), true);
            },

            onCloseDownloadData: function (oEvent) {
                this.getView().byId("id_Repository_DownloadData").close();
            },

            onItemPressOfDownloadData: function (oEvent) {
                let listItem = oEvent.getParameters("listItem").listItem;
                let title = oEvent.getParameters("listItem").listItem.mProperties.title;
                let sPath = oEvent.getParameters().listItem.mBindingInfos.title.binding.oContext.sPath;
                let DownloadData = this.getModelDetails("DownloadData");
                let name = DownloadData.getProperty(`${sPath}/name`);
                if (name === "MATERIAL_HEADER") {
                    oEvent.getSource().setSelectedItem(listItem, true);
                }
            },

            onClickDownloadData: function (oEvent) {
                let repositoryModel = this.getModelDetails("Repository"),
                    materialList = [],
                    that = this,
                    filterPayload = this.fnFormRepoAdvSearchPayload(),
                    listOfSelectedUiView = this.fnGetSelectedUiView();

                filterPayload.uiView = listOfSelectedUiView;

                this.openBusyDialog();

                this.fnProcessDataRequest("MM_JAVA_MASS/dynamicAdvancedSearchRepositoryDownload", "POST", null, true, filterPayload, function (responseData, responseHeader) {
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
                    });
            },

            fnGetSelectedUiView: function () {
                let DownloadDataList = this.getView().byId("DownloadDataListRepo"),
                    selectedItems = DownloadDataList.getSelectedContexts();
                let DownloadData = this.getModelDetails("DownloadData"),
                    listOfSelectedUiView = [];
                selectedItems.map(function (item) {
                    if (DownloadData.getProperty(`${item.sPath}/name`) != "MATERIAL_HEADER") {
                        listOfSelectedUiView.push(DownloadData.getProperty(`${item.sPath}/name`));
                    }

                })

                return listOfSelectedUiView;
            }

        });
    });