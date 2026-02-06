sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/viatris/materialmaster/controller/BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller..
     */
    function (Controller, BaseController) {
        "use strict";

        return BaseController.extend("com.viatris.materialmaster.controller.App", {
            onInit: function () {
                let that = this,
                    lookupModel = this.getModelDetails("LookupModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails");

                lookupModel.setSizeLimit(999999);
                MaterialDetails.setSizeLimit(999999);

                this.fnGetCurrentUser()
                    .then(async function () {
                        const taskId = await that.getUrlTaskID();
                        that.onLoadNavIcon();
                        await that.onLoadRulesData();
                        that.fnLoadLookupData();
                        that.onGettingTaskID(taskId);
                    })
                    .catch(err => {
                        console.error("Error fetching current user:", err);
                    });
            },


            //Function to get the current User
            // fnGetCurrentUser: function () {
            //     return new Promise((resolve) => {
            //         let that = this,
            //             oAppModel = this.getModelDetails("oAppModel"),
            //             oHeaders = {
            //                 ConsistencyLevel: "eventual"
            //             };
            //         that.fnProcessDataRequest("user-api/currentUser", "GET", oHeaders, false, null,
            //             function (responseData) {
            //                 let currentUserName = responseData.firstname + " " + responseData.lastname,
            //                     userDetails = {
            //                         "displayName": responseData.displayName,
            //                         "userName": currentUserName,
            //                         "userMailID": responseData.name
            //                     };
            //                 oAppModel.setProperty("/userdetails", userDetails);
            //             },
            //             function (responseData) { });
            //         resolve(true);
            //     })
            // },

            fnGetCurrentUser: function () {
                return new Promise((resolve, reject) => {
                    let that = this,
                        oAppModel = this.getModelDetails("oAppModel"),
                        oHeaders = {
                            "caseId": 0,
                            "materialListId": 0,
                            "materialNumber": 0,
                            "requestNumber": 0,
                            "response": {},
                            "responseMessage": "string",
                            "status": "string",
                            "statusCode": "string"
                        };

                    this.fnProcessDataRequest("MM_JAVA/role-collection", "GET", oHeaders, false, null,
                        function (oResponse) {
                            let responseData = oResponse?.response,
                                currentUserName = responseData?.givenName + " " + responseData?.familyName,
                                displayName = currentUserName + " (" + responseData?.emailId + ")",
                                userDetails = {
                                    "displayName": displayName,
                                    "userName": currentUserName,
                                    "userMailID": responseData?.emailId,
                                    "userRole": responseData?.rolesAction,
                                    "btpRoles": responseData?.roles
                                };
                            oAppModel.setProperty("/userdetails", userDetails);
                            that.updateSideNavigationVisibility();
                            resolve(true);
                        },
                        function (error) {
                            reject(error);
                        });
                });
            },


            // fnGetCurrentUserRole: function () {
            //     let oAppModel = this.getModelDetails("oAppModel");
            //     let currentUserEmail = oAppModel.getProperty("/userdetails/userMailID");
            //     let roleMappings = oAppModel.getProperty("/roleMappings") || [];

            //     // Find the role for the current user
            //     let currentUserRole = roleMappings.find(role => role.userMailID === currentUserEmail)?.userRole || null;

            //     oAppModel.setProperty("/userdetails/userRole", currentUserRole);

            //     this.updateSideNavigationVisibility(currentUserRole);
            // },

            updateSideNavigationVisibility: function () {
                let oAppModel = this.getModelDetails("oAppModel"),
                    userRole = oAppModel.getProperty("/userdetails/userRole");

                // Applying visibility for Side Nav
                let isRepositoryVisible = userRole?.includes("Repository Display") || userRole?.includes("Repository Edit") || false,
                    isMassRequestVisible = userRole?.includes("Mass Upload Request Submission") || false;
                oAppModel.setProperty("/sideNavigation/sidePanelItemVisibility/Repository", isRepositoryVisible);
                oAppModel.setProperty("/sideNavigation/sidePanelItemVisibility/MassRequest", isMassRequestVisible);
            },

            onItemSelect: function (oEvent) {
                var key = oEvent.getParameter("item").getKey(),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView");
                this.onLoadNavIcon();
                if (key === "PageRequestManagement") {
                    oAppModel.setProperty("/sideNavigation/icon/RequestManagement", "sap-icon://folder-full");
                    let navigationTo = "RequestManagement"
                    if (currentView === "CreateProject") {
                        this.confirmPageNavigation(navigationTo)
                    }
                    else {
                        this.navigateTo(navigationTo)
                    }
                }
                else if (key === "PageMassRequest") {
                    oAppModel.setProperty("/sideNavigation/icon/MassRequest", "sap-icon://checklist-2");
                    let navigationTo = "MassRequest"
                    if (currentView === "CreateProject") {
                        this.confirmPageNavigation(navigationTo)
                    }
                    else {
                        this.navigateTo(navigationTo)
                    }
                }
                else if (key === "PageReport") {
                    oAppModel.setProperty("/sideNavigation/icon/Report", "sap-icon://area-chart");
                    let navigationTo = "Reports"
                    if (currentView === "CreateProject") {
                        this.confirmPageNavigation(navigationTo)
                    }
                    else {
                        this.navigateTo(navigationTo)
                    }
                }
                else if (key === "PageRepository") {
                    oAppModel.setProperty("/sideNavigation/icon/Repository", "sap-icon://master-task-triangle-2");
                    let navigationTo = "Repository"
                    if (currentView === "CreateProject") {
                        this.confirmPageNavigation(navigationTo)
                    }
                    else {
                        let Repository = this.getModelDetails("Repository");
                        Repository.setProperty("/MaterialSelected/repoSubmitFor", null);
                        Repository.setProperty("/MaterialSelected/showRepoFooterActions", false);
                        this.navigateTo(navigationTo)
                    }
                }
                else if (key === "ExpandOrCollapse") {
                    var oSideNavigation = this.byId("sideNavigation"),
                        bExpanded = oSideNavigation.getExpanded();
                    oSideNavigation.setExpanded(!bExpanded);
                }
            },

            onLoadNavIcon: function () {
                var oAppModel = this.getModelDetails("oAppModel"),
                    navIconList = {};
                navIconList = {
                    "RequestManagement": "sap-icon://folder-blank",
                    "Report": "sap-icon://line-chart",
                    "MassRequest": "sap-icon://checklist",
                    "Repository": "sap-icon://master-task-triangle"
                };
                oAppModel.setProperty("/sideNavigation/icon", navIconList);
            },

            onLoadRulesData: function () {
                return new Promise(async (resolve) => {
                    let that = this,
                        lookupModel = this.getModelDetails("LookupModel"),
                        localRefModel = new sap.ui.model.json.JSONModel(),
                        path = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/LookupData.json");

                    await localRefModel.loadData(path);
                    var localRefModelData = localRefModel.getData();
                    lookupModel.setData(localRefModelData,true);
                    var rulePayload = lookupModel.getProperty("/rulesList");

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
                                        switch (list.tableName) {
                                            case "MM_REQUEST_STATUS_REF_LIST":
                                                let reqStatusList = lookupModel.getProperty("/requestStatusList");
                                                for (let i = 0; i < resultData.length; i++) {
                                                    let mappedObj = reqStatusList.find(obj =>
                                                        obj.MM_KEY == resultData[i].MM_KEY
                                                    );
                                                    resultData[i] = { ...mappedObj, ...resultData[i] };
                                                }
                                                break;
                                            case "MM_REQUEST_TYPE_REF_LIST":
                                                let resultDataReqMgmtReqType,
                                                    resultDataMassReqType;

                                                lookupModel.setProperty("/allRequestType", resultData);
                                                resultDataReqMgmtReqType = resultData.filter(item => !item.MM_MASS_REQUEST);
                                                lookupModel.setProperty("/requestType", resultDataReqMgmtReqType);

                                                resultDataMassReqType = resultData.filter(item => item.MM_MASS_REQUEST);
                                                lookupModel.setProperty("/massRequestRequestType", resultDataMassReqType);
                                                break;
                                        }
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

            // fnLoadLookupData: function () {
            //     var oZapiMaterialSrvModel = this.getModelDetails("ZapiMaterialOModel"),
            //         LookupModel = this.getModelDetails("LookupModel"),
            //         oZapiMaterialSrvModel2 = this.getModelDetails("ZapiOdataModel"),
            //         MaterialDetails = this.getModelDetails("MaterialDetails"),
            //         // sLanguageUrl = "/LanguageSet?$format=json",
            //         sClasstype = MaterialDetails.getProperty("/SystemDetails/Classification/Classtype");
            //         // sClassificationUrl = "/ClassificationDataSet?$format=json&$filter=Classtype eq " + sClasstype;
            //     // oZapiMaterialSrvModel.read(sLanguageUrl, null, null, false, function (resData) {
            //     //     LookupModel.setProperty("/Language", resData.results);
            //     // });
            //     /* oZapiMaterialSrvModel2.read(sClassificationUrl, null, null, false, function (resData) {

            //           LookupModel.setProperty("/Classification/data/ClassificationClass", resData.results)
            //       });*/
            //     oZapiMaterialSrvModel2.read("/ClassificationDataSet", {
            //         urlParameters: {
            //             "$filter": "Classtype eq '" + sClasstype + "'"
            //         },
            //         success: function (resData) {
            //             LookupModel.setProperty("/ClassificationClass", resData.results);
            //             MaterialDetails.setProperty("/Classification/classnum", "GMDM");
            //         },
            //         error: function (oError) {

            //         }
            //     });
            // },

            fnLoadLookupData: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    dropdownModelList = LookupModel.getProperty("/oDataTargetSystemIdToModelClassification"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    sClasstype = MaterialDetails.getProperty("/SystemDetails/Classification/Classtype");

                Object.entries(dropdownModelList).map(([key, value]) => {
                    let clasListPath = "/classificationClassList/" + key,
                        dropdownModel = this.getModelDetails(value),
                        bindingPath = clasListPath + "/" + "ClassificationClass";
                    LookupModel.setProperty(clasListPath, {});
                    dropdownModel.setUseBatch(false);
                    dropdownModel.read("/ClassificationDataSet", {
                        urlParameters: {
                            "$filter": "Classtype eq '" + sClasstype + "'"
                        },
                        success: function (resData) {
                            LookupModel.setProperty(bindingPath, resData.results);
                            // MaterialDetails.setProperty("/SystemDetails/Classification/classnum", "GMDM");
                        },
                        error: function (oError) {
                            LookupModel.setProperty(bindingPath, []);
                        }
                    });
                });
            },

            getUrlTaskID: function () {
                return new Promise((resolve) => {
                    var urlApp = window.location.href,
                        propertyURL = new URL(urlApp),
                        urlTaskString = propertyURL?.hash?.split("&"),
                        taskId = urlTaskString[1]?.split("=")[1];
                    if (taskId === null || taskId === "" || taskId === undefined) {
                        resolve(null);
                    }
                    resolve(taskId);
                })
            },

            onGettingTaskID: async function (taskId) {
                var oAppModel = this.getModelDetails("oAppModel"),
                    that = this;
                if (taskId != null) {
                    oAppModel.setProperty("/taskDetails/taskId", taskId);
                    await this.fnGetTaskDefinitionID(taskId).then(function (isSuccessTaskStatus) {
                        if (isSuccessTaskStatus) {
                            that.onGetWFContext(taskId).then(function (context) {
                                let requestNumber = context?.creationFromWorkflowRequest?.requestNumber,
                                    lastApproverTaskName = context?.workflowTaskDetails?.lastApproverTaskName,
                                    workflowDefinitionId = oAppModel.getProperty("/taskDetails/workflowDefinitionId");
                                oAppModel.setProperty("/taskDetails/lastApproverTaskName", lastApproverTaskName);
                                if (workflowDefinitionId === "materialmasterworkflow") {
                                    that.onGetRequestData(requestNumber);
                                }
                                else if (workflowDefinitionId === "materialmassuploadworkflow") {
                                    that.fnGetMassRequestData(requestNumber);
                                    that.getWorkflowDetails(requestNumber, "CreateMassRequest", workflowDefinitionId);
                                }
                            });
                        }
                    });
                }
                else {
                    oAppModel.setProperty("/sideNavigation/visible", true);
                }
            },

            // fnGetTaskDefinitionID: function (taskId) {
            //     return new Promise((resolve) => {
            //         var oAppModel = this.getOwnerComponent().getModel("oAppModel"),
            //             lookupModel = this.getModelDetails("LookupModel"),
            //             sUrl = "MM_WORKFLOW/rest/v1/task-instances/" + taskId,
            //             oHeader = {},
            //             that = this;
            //         that.fnProcessDataRequest(sUrl, "GET", oHeader, true, null,
            //             function (response) {
            //                 let loggedInUserEmail = oAppModel.getProperty("/userdetails/userMailID"),
            //                     taskStatus = response?.status;
            //                 oAppModel.setProperty("/taskDetails/wfTaskInstanceId", response?.id);
            //                 if (taskStatus === "CANCELED" || taskStatus === "COMPLETED" || (taskStatus === "RESERVED" && response?.processor !== loggedInUserEmail)) {
            //                     let actions = ["OK"],
            //                         msg = that.geti18nText("taskIsAlready") + that.geti18nText(taskStatus);
            //                     that.showMessage(msg, "I", actions, "OK", function (action) {
            //                         if (action === "OK") {
            //                             window.top.close();
            //                         }
            //                     });
            //                     resolve(false);
            //                 }
            //                 else {
            //                     let definitionID = response.definitionId,
            //                         wfTaskName = response.description,
            //                         workflowDefinitionId = response.workflowDefinitionId,
            //                         wfTaskType = null,
            //                         taskRefData = lookupModel.getProperty("/WorkflowDetails/taskNameMappings"),
            //                         mappedObj = null;
            //                     try {
            //                         mappedObj = taskRefData.find(obj =>
            //                             obj.definitionID == definitionID
            //                         );
            //                         wfTaskType = mappedObj.wfTaskType;
            //                     } catch (e) { }
            //                     oAppModel.setProperty("/taskDetails/wfTaskType", wfTaskType);
            //                     oAppModel.setProperty("/taskDetails/wfTaskName", wfTaskName);
            //                     oAppModel.setProperty("/taskDetails/workflowDefinitionId", workflowDefinitionId);
            //                 }
            //                 resolve(true);
            //             },
            //             function (error) {
            //                 resolve(false);
            //             });
            //     });
            // },

            fnGetTaskDefinitionID: function (taskId) {
                return new Promise((resolve) => {
                    var oAppModel = this.getOwnerComponent().getModel("oAppModel"),
                        lookupModel = this.getModelDetails("LookupModel"),
                        sUrl = "MM_WORKFLOW/rest/v1/task-instances/" + taskId,
                        oHeader = {},
                        that = this;

                    function fetchTask(attempt = 1) {
                        that.fnProcessDataRequest(sUrl, "GET", oHeader, true, null,
                            function (response) {
                                let loggedInUserEmail = oAppModel.getProperty("/userdetails/userMailID"),
                                    taskStatus = response?.status,
                                    processor = response?.processor;

                                // retry if RESERVED but processor not yet set
                                if (taskStatus === "RESERVED" && !processor && attempt < 3) {
                                    setTimeout(() => fetchTask(attempt + 1), 1000); // retry after 1s
                                    return;
                                }

                                oAppModel.setProperty("/taskDetails/wfTaskInstanceId", response?.id);

                                if (taskStatus === "CANCELED" || taskStatus === "COMPLETED" ||
                                    (taskStatus === "RESERVED" && processor !== loggedInUserEmail)) {
                                    let actions = ["OK"],
                                        msg = that.geti18nText("taskIsAlready") + that.geti18nText(taskStatus);
                                    that.showMessage(msg, "I", actions, "OK", function (action) {
                                        if (action === "OK") {
                                            window.top.close();
                                        }
                                    });
                                    resolve(false);
                                } else {
                                    // success flow
                                    let definitionID = response.definitionId,
                                        wfTaskName = response.description,
                                        workflowDefinitionId = response.workflowDefinitionId,
                                        taskRefData = lookupModel.getProperty("/WorkflowDetails/taskNameMappings"),
                                        wfTaskType = null;

                                    try {
                                        wfTaskType = taskRefData.find(obj => obj.definitionID == definitionID)?.wfTaskType;
                                    } catch (e) { }

                                    oAppModel.setProperty("/taskDetails/wfTaskType", wfTaskType);
                                    oAppModel.setProperty("/taskDetails/wfTaskName", wfTaskName);
                                    oAppModel.setProperty("/taskDetails/workflowDefinitionId", workflowDefinitionId);

                                    resolve(true);
                                }
                            },
                            function (error) {
                                resolve(false);
                            }
                        );
                    }

                    fetchTask();
                });
            },


        });
    });
