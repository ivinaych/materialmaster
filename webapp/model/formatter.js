sap.ui.define(
    [],
    function () {
        "use strict";
        var s_WF_GMDM = "GMDM_WF_Task",
            s_WF_GQMD = "GQMD_WF_Task",
            s_WF_Flex = "Flex_WF_Task",
            s_WF_Requestor = "Request_Form_Submission",
            s_WF_Rework = "Requester_Rework_WF_Task",
            id_MS_Draft = 1,
            id_MS_Inprogress = 2,
            id_MS_Commited_To_Repo_NotSyndicated = 10,
            id_MS_Commited_To_Repo_SyndicatedError = 11,
            id_MS_Syndicated = 9,
            id_MS_Excluded = 6,
            id_MS_Not_Applicable = 13,
            id_MS_Not_Selected = 15,
            id_MS_SyndicationFailed = 16;

        return {
            //Request Managment
            getRequestTypetext: function (requestTypeId, requestTypeData) {
                try {
                    let mappedObj = requestTypeData.find(obj =>
                        obj.MM_KEY == requestTypeId
                    );
                    return mappedObj.MM_REQUEST_TYPE_DESCRIPTION;
                } catch {
                    return null;
                }
            },

            getStatustext: function (status, statusData) {
                try {
                    let mappedObj = statusData.find(obj =>
                        obj.MM_KEY == status
                    );
                    return mappedObj.MM_REQUEST_STATUS_DESCRIPTION;
                } catch {
                    return null;
                }
            },

            getMaterialTypetext: function (materialTypeId, materialTypeData) {
                try {
                    let mappedObj = materialTypeData.find(obj =>
                        obj.MM_KEY == materialTypeId
                    );
                    return mappedObj.MM_MATERIAL_TYPE_SAP_CODE;
                } catch {
                    return null;
                }
            },

            getSystemText: function (systemId, systemLookup) {
                // console.log("getDocumentmarkForSyndicationEnability---> systemId outside is= "+systemId);
                try {
                    let mappedObj = systemLookup.find(obj =>
                        obj.MM_KEY == systemId
                    );
                    return mappedObj.MM_SYSTEM_REF_LIST_CODE;
                } catch {
                    return null;
                }
            },

            getRequestChangeNewValue: function (fieldName, newValue) {
                var LookupModel = this.getModelDetails("LookupModel");
                switch (fieldName) {
                    case "requestTypeId":
                        var requestTypeData = LookupModel.getProperty("/requestType"),
                            requestTypeId = newValue;
                        try {
                            let mappedObj = requestTypeData.find(obj =>
                                obj.MM_KEY == requestTypeId
                            );
                            return mappedObj.MM_REQUEST_TYPE_DESCRIPTION;
                        } catch {
                            return null;
                        }
                    case "materialTypeId":
                        var materialTypeData = LookupModel.getProperty("/materialType")
                        var materialTypeId = newValue;
                        try {
                            let mappedObj = materialTypeData.find(obj =>
                                obj.MM_KEY == materialTypeId
                            );
                            return mappedObj.MM_MATERIAL_TYPE_SAP_CODE;
                        } catch {
                            return null;
                        }
                    case "materialStatusId":
                        var materialStatusData = LookupModel.getProperty("/materialStatus")
                        var materialStatusId = newValue;
                        try {
                            let mappedObj = materialStatusData.find(obj =>
                                obj.MM_KEY == materialStatusId
                            );
                            return mappedObj.MM_MATERIAL_STATUS_DESCRIPTION;
                        } catch {
                            return null;
                        }
                    case "requestStatusId":
                        var requestStatusData = LookupModel.getProperty("/requestStatus")
                        var requestStatusId = newValue;
                        try {
                            let mappedObj = requestStatusData.find(obj =>
                                obj.MM_KEY == requestStatusId
                            );
                            return mappedObj.MM_REQUEST_STATUS_DESCRIPTION;
                        } catch {
                            return null;
                        }
                    case "requestSubTypeId":
                        var requestSubTypeData = this.getModelDetails("LookupModel").getProperty("/reqSubType");
                        var requestSubTypeId = newValue;
                        try {
                            let mappedObj = requestSubTypeData.find(obj =>
                                obj.MM_KEY == requestSubTypeId
                            );
                            return mappedObj.MM_SUB_REQUEST_DESC;
                        } catch {
                            return null;
                        }
                    case "systemId":
                        var systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST");
                        var systemId = newValue;
                        try {
                            let mappedObj = systemLookup.find(obj =>
                                obj.MM_KEY == systemId
                            );
                            return mappedObj.MM_SYSTEM_REF_LIST_CODE;
                        } catch {
                            return null;
                        }
                    case "requestorOrganization":
                        var requestorOrg = LookupModel.getProperty("/requestorOrganization");
                        var requestorOrganization = newValue;
                        try {
                            let mappedObj = requestorOrg.find(obj =>
                                obj.MM_KEY == requestorOrganization
                            );
                            return mappedObj.MM_REQUESTOR_ORG_REF_LIST_CODE + "-" + mappedObj.MM_REQUESTOR_ORG_REF_LIST_DESC;
                        } catch {
                            return null;
                        }

                    default:
                        return newValue;
                }
            },

            enableLeftNavButton: function (firstPage) {
                return firstPage !== 1;
            },

            enableRightNavButton: function (currentPage, totalPages) {
                return currentPage !== totalPages;
            },

            fnHandleXPlantText: function (MaterialStatus, Description) {
                if (MaterialStatus == "BLANK") {
                    return Description;
                }
                return `${MaterialStatus} - ${Description}`
            },

            //Material List
            fnSetVisibleRepoStatus: function (currentView, requestType) {
                return !(currentView == "CreateProject" && requestType == 1); // Return false, if request type is Create
            },

            //Action Footer
            fnVisibleViewChanges: function (materialList, selectedCreateProjectTab) {
                if (materialList?.length && selectedCreateProjectTab == "materialList") {
                    return true;
                }
                return false;
            },

            fnVisibleDeleteDraft: function (requestStatus, requestNo) {
                if (requestStatus !== 1) {
                    return false;
                }
                return Boolean(requestNo);
            },

            fnVisibleSaveRequestHeader: function (SelectedTabKey, requestStatus, wfTaskType) {
                if (SelectedTabKey !== "requestHeader") {
                    return false;
                }
                if ((requestStatus == 1 && wfTaskType == s_WF_Requestor) || (requestStatus == 2 && (wfTaskType == s_WF_GMDM || wfTaskType == s_WF_Rework))) {
                    return true;
                }
                return false;
            },

            fnParentRootReqFieldVisibility: function (parentRootValue) {
                if (parentRootValue) {
                    return true;
                }
                return false;
            },

            fnVisibleSubmitML: function (SelectedTabKey, wfTaskType, requestStatus) {
                if (SelectedTabKey !== "materialList") {
                    return false;
                }
                if (requestStatus == 1 && wfTaskType == s_WF_Requestor) {
                    return true;
                }
                return false;
            },

            fnEnableSubmitML: function (materialList) {
                try {
                    if (!materialList?.length) {
                        return false;
                    }
                }
                catch (e) { }
                let allExcluded = true;
                for (let material of materialList) {
                    if ((material.materialStatusId != id_MS_Draft && material.materialStatusId != id_MS_Excluded) || !material.validated)
                        return false;

                    if (material.materialStatusId != id_MS_Excluded) {
                        allExcluded = false;
                    }
                }
                return !allExcluded;
            },

            fnVisibleMassSaveRequestHeader: function (SelectedTabKey, requestStatus, wfTaskType) {
                if (SelectedTabKey !== "requestHeader") {
                    return false;
                }
                if (requestStatus == 1 && wfTaskType == s_WF_Requestor) {
                    return true;
                }
                return false;
            },

            fnMassUIViewVisible: function (requestType) {
                if (requestType == "4" || requestType == "7" || requestType == "8") {
                    return false;
                }
                return true;
            },

            fnMassMarkForSyndVisiblility: function (requestType) {
                if (requestType == "4" || requestType == "7" || requestType == "8") {
                    return true;
                }
                return false;
            },

            fnVisibleMassSubmit: function (SelectedTabKey, requestStatus) {
                if (SelectedTabKey !== "massUpload") {
                    return false;
                }
                if (requestStatus == 1) {
                    return true;
                }
                return false;
            },

            fnVisibleMassSave: function (SelectedTabKey, requestStatus, attachmentCount) {
                if (SelectedTabKey !== "massUpload") {
                    return false;
                }
                if (requestStatus == 1 && !attachmentCount) {
                    return true;
                }
                return false;
            },

            fnRequestorMassVisible: function (isUserRequestOwner, requestStatus, wfTaskType) {
                try {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor && requestStatus == "1") {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                catch (e) { }
            },

            //Documents & Comments 
            getDocumenticon: function (docType) {
                //PDF, DOC, DOCX, XLSX, XLS, CSV, PNG or JPEG
                let docIcon = "sap-icon://add-document";
                try {
                    if (docType.includes("pdf")) docIcon = "sap-icon://pdf-attachment";
                    else if (docType.includes("doc")) docIcon = "sap-icon://add-document";
                    else if (docType.includes("xlsx")) docIcon = "sap-icon://excel-attachment";
                    else if (docType.includes("csv")) docIcon = "sap-icon://excel-attachment";
                    else if (docType.includes("png")) docIcon = "sap-icon://attachment-photo";
                    else if (docType.includes("jpeg")) docIcon = "sap-icon://attachment-photo";
                }
                catch (e) { }
                return docIcon;
            },

            getDocumentIncludeEnability: function (wfTaskType, isSyndicated, included) {
                if (wfTaskType && (wfTaskType === "GMDM_WF_Task" || wfTaskType === "GQMD_WF_Task")) {
                    if (isSyndicated) {
                        return false;
                    }
                    if (!included) return false;

                    return true;
                }
                return false;
            },

            getSyndicateDocumentButtonEnability: function (isSyndicated, wfTaskType, requestType, documents, currentView, documentEditability, isUserRequestOwner, repoSubmitFor) {
                if (!documents) documents = [];

                // Enable for Repository view when in Edit, Extend or Edit Doc mode
                if (currentView === "Repository" && documentEditability) {
                    for (let i = 0; i < documents.length; i++) {
                        if (documents[i].documentSyndicationStatus == 10 || documents[i].documentSyndicationStatus == 11) {
                            return true;
                        }
                    }
                    return false;
                }

                if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                    return false;
                }

                if (wfTaskType === "GMDM_WF_Task" && isSyndicated && requestType == 1) {
                    for (let i = 0; i < documents.length; i++) {
                        if (documents[i].documentSyndicationStatus == 9) {
                            return false;
                        }
                    }

                    return true;
                }



                return false;
            },

            getSyndicateDocumentButtonVisibility: function (isSyndicated, wfTaskType, requestType, documents, currentView, documentEditability, repoSubmitFor) {
                if (currentView === "Repository") {
                    return true;
                }
                if (requestType == 2 || requestType == 3 || requestType == 6) {
                    return false;
                }
                return true;
            },

            getFileUploadBtnEnability: function (materialStatus, currentView, documentEditability, wfTaskType, isUserRequestOwner) {
                // let flag = (requestStatus == 1 || requestStatus == 2 || (currentView === "Repository" && documentEditability));
                // return flag ? flag : false;
                if (currentView == "CreateProject") {
                    if ((wfTaskType == s_WF_Requestor && (materialStatus && materialStatus != id_MS_Draft))) {
                        return false;
                    }
                    return true;
                } else if (currentView == "Repository") {
                    if (documentEditability) {
                        return true;
                    }
                    return false;
                }
            },

            getDocumentDeleteEnability: function (application_taskInstanceId, taskInstanceId, statusId, uploadedBy, loggedInUserEmail, documentEditability, currentView, documentSyndicationStatus) {
                //check if it is a task
                //if yes, check current taskInstanceId and taskName with the associated ones
                //check if uploadBy match the loginUserName
                //if yes, return true
                //else, return false
                //if no, check if it is in draft state
                //if draft, enable delete, else false

                if (documentSyndicationStatus == 9) {
                    return false;
                }

                if (currentView === "Repository") {
                    if (documentEditability) {
                        return true;
                    }

                    return false;
                } else {
                    if (application_taskInstanceId) {
                        if (application_taskInstanceId === taskInstanceId) {
                            if (uploadedBy === loggedInUserEmail) {
                                return true;
                            }
                        }
                    } else if (statusId == 1) {
                        return true;
                    } else {
                        return false;
                    }
                    return false;
                }
            },

            getDocumentUploadEnability: function (wfTaskType) {
                if (wfTaskType && wfTaskType === "GMDM_WF_Task") {
                    return true;
                }
                return false;
            },

            getDocumentmarkForSyndicationEnability: function (systemId, wfTaskType, documentSyndicationStatus, selectedSystems, currentView) {
                try {
                    // console.log(`getDocumentmarkForSyndicationEnability---> systemId=${systemId}`);


                    // console.log(`getDocumentmarkForSyndicationEnability---> ${JSON.stringify(this.getView()?.getModel("docCommentModel").getData().selectedDocument[0].systemData.dmsDocSystemId)}`);
                    // debugger;
                    if (currentView != "Repository" && wfTaskType && (wfTaskType === "Flex_WF_Task" || wfTaskType === "Request_Form_Submission")) {
                        return false;
                    }
                    let system = selectedSystems.find(sys => sys.MM_SYSTEM_ID == systemId);

                    // console.log(`getDocumentmarkForSyndicationEnability---> system=${JSON.stringify(system)}`);



                    if (system?.requestSystemStatusId == 9) {
                        return true;
                    }

                    return false;

                    // if (wfTaskType && (wfTaskType === "Flex_WF_Task" || wfTaskType === "Request_Form_Submission")) {
                    //     return false;
                    // }
                    // return true;
                } catch {
                    return false;
                }
            },

            getDocumentAddSystemEnability: function (listOfAllSystems = [], selectedDocument) {
                try {
                    let that = this,
                        viewName = that.gViewName,
                        listOfSystemsNotPresentInSelectedDocument = [];
                    // Extract system IDs from the single selectedDocument object
                    const selectedSystemIds = selectedDocument?.systemData?.map(system => system.dmsDocSystemId);

                    // Filter systems not present in selectedDocument
                    // listOfSystemsNotPresentInSelectedDocument = listOfAllSystems?.filter(system =>
                    //     !selectedSystemIds?.includes(system?.systemId)
                    // );

                    for (let i = 0; i < listOfAllSystems.length; i++) {
                        let system = listOfAllSystems[i];
                        let sys = selectedSystemIds.find(s => s == system?.MM_SYSTEM_ID);
                        if (!sys) {
                            if (viewName == "Repository"){
                                if((system.repositorySystemStatusId == 1 || system.repositorySystemStatusId == 2 || system.repositorySystemStatusId == 9 || system.repositorySystemStatusId == 10 || system.repositorySystemStatusId == 11 || system.repositorySystemStatusId == 13)){
                                    listOfSystemsNotPresentInSelectedDocument.push(system);
                                }
                            }
                            if(viewName == "CreateProject"){
                                if(system.requestSystemStatusId == 1 || system.requestSystemStatusId == 2 || system.requestSystemStatusId == 9 || system.requestSystemStatusId == 10 || system.requestSystemStatusId == 11 || system.requestSystemStatusId == 13){
                                    listOfSystemsNotPresentInSelectedDocument.push(system);
                                }
                            }
                        }

                    }

                    return listOfSystemsNotPresentInSelectedDocument.length == 0 ? false : true;
                } catch {
                    return false;
                }

            },

            getDocumentSystemDeleteButtonVisibility: function (status) {
                if (status == 1) {
                    return true;
                } else return false;
            },

            //cases

            getCaseTypeText: function (caseType, listofCaseType) {
                try {
                    let caseTypeDesc = listofCaseType.find(element => element.MM_KEY == caseType);
                    if (caseTypeDesc)
                        return caseTypeDesc.MM_CASE_TYPE_REF_LIST_DESC;
                    else return caseType;
                }
                catch (e) { }
            },

            getCaseStatusText: function (caseStatus, listOfCaseStatus) {
                try {
                    let caseStatusDesc = listOfCaseStatus.find(element => element.MM_KEY == caseStatus);
                    if (caseStatusDesc)
                        return caseStatusDesc.MM_CASE_STATUS_REF_LIST_DESC;
                    else return caseStatus;
                }
                catch (e) { }
            },

            getTotalCases: function (totalCases) {
                if (!totalCases) return 0;
                else return totalCases;
            },

            getCaseVisibility: function (materialListId, currentView, wfTaskType) {
                if (currentView == "Repository") {
                    return false;
                } else {
                    if (wfTaskType)
                        return true;
                    else return false;
                }
            },

            getCaseEditability: function (materialListId, wfTaskType) {
                if (wfTaskType && (wfTaskType === "Request_Form_Submission" || wfTaskType === "Requester_Rework_WF_Task")) {
                    return false;
                } else if (wfTaskType) {
                    return true;
                } else return false;
            },

            handleCaseEditButtonEnability: function (caseStatus) {
                if (caseStatus == 2) {
                    return false;
                }
                return true;
            },

            // Create Project
            requestNoExist: function (requestNo) {
                return Boolean(requestNo);
            },

            fnCreateProjectBackBtn: function (wfTaskName) {
                if (wfTaskName === s_WF_Requestor) {
                    return true;
                }
                return false;
            },

            fnShowWfTaskName: function (wfTaskName) {
                if (wfTaskName === s_WF_Requestor) {
                    return false;
                }
                return true;
            },

            deleteDraftRequestVisible: function (requestStatus, requestNo) {
                if (requestStatus !== 1) {
                    return false;
                }
                return Boolean(requestNo);
            },

            onConvertBooleanType: function (isTrue) {
                return (isTrue == true) ? true : false;
            },

            fnSetEnableforSelectedRowWithValidation: function (selectedPath, materialListId, isValidated, isEnable) {
                if (!isEnable || !isValidated) {
                    return false;
                }
                let CreateProject = this.getModelDetails("CreateProject"),
                    selectedMaterialListId = CreateProject.getProperty(selectedPath)?.materialListId;
                return (selectedMaterialListId === materialListId);
            },

            fnSetEnableforRepoSelectedMLRow: function (valueFor, selectedPath, materialNumber, repoSubmitFor) {
                let Repository = this.getModelDetails("Repository"),
                    selectedMaterialNo = Repository.getProperty(selectedPath)?.materialNumber;
                // return (selectedMaterialNo === materialNumber);
                if (selectedMaterialNo === materialNumber) {
                    if (!repoSubmitFor || (repoSubmitFor && repoSubmitFor == valueFor)) {
                        return true;
                    }
                    // 792 ticket
                    if (repoSubmitFor === valueFor) {
                        return true;
                    }

                    if (repoSubmitFor === "Modify" || repoSubmitFor === "Extend") {
                        return false;
                    }
                }
                return false;
            },

            fnSetEnableforSelectedRow: function (selectedPath, materialListId, isEnable) {
                if (!isEnable) {
                    return false;
                }
                let CreateProject = this.getModelDetails("CreateProject"),
                    selectedMaterialListId = CreateProject.getProperty(selectedPath)?.materialListId;
                return (selectedMaterialListId === materialListId);
            },

            fnToActionColumVisibility: function (requestStatus, wfTaskType, isUserRequestOwner) {
                if (requestStatus === 3) {
                    return false;
                }
                if (wfTaskType === s_WF_Requestor && requestStatus != 1) {
                    return false;
                }
                if (wfTaskType === s_WF_Flex) {
                    return false;
                }
                if (!isUserRequestOwner && wfTaskType === s_WF_Requestor) {
                    return false;
                }
                return true;
            },

            fnToValidatedColumVisibility: function (requestStatus, wfTaskType) {
                if (requestStatus === 3) {
                    return false;
                }
                if (wfTaskType === s_WF_Requestor && requestStatus != 1) {
                    return false;
                }
                if (wfTaskType === s_WF_Flex) {
                    return false;
                }
                return true;
            },

            fnVisible_AaddBtn_ML: function (wfTaskType, requestStatus, isUserRequestOwner) {
                if (wfTaskType == s_WF_Requestor && requestStatus == 1 && isUserRequestOwner) {
                    return true;
                }
                return false;
            },

            fnEnableDelete_AlternateID: function (isVisible, isNewlyAdded, isModified, wfTaskType, requestTypeId, currentView) {
                // return isVisible ? ((isNewlyAdded == false) ? false : true) : false;
                if(isVisible){
                    if(wfTaskType === s_WF_GMDM && !isNewlyAdded){
                        return false
                    }
                    if((isModified && requestTypeId == 3 && !isNewlyAdded) || (isModified && currentView == "Repository" && !isNewlyAdded)){
                        return false;
                    }
                    return true;
                }

                return false;
            },

            // Material List 
            formatValidationState: function (validated) {
                return validated ? "Success" : "Error";
            },

            //System Details
            fnSetEditabilityforNonSAPFields: function (basicDataVal) {
                if (basicDataVal === true || basicDataVal === "Yes" || basicDataVal === "yes") {
                    return true;
                }
                return false;
            },

            fnSetEditabilityforTransGrp: function (currentView, requestType, selectedPlants, currSystem, repoSubmitFor, basicDataVal) {
                if (basicDataVal === true || basicDataVal === "Yes" || basicDataVal === "yes") {

                    if (currentView == "CreateProject") {
                        if (requestType == "1" || requestType == "2" || requestType == "6") {
                            let isSysPlantExists = false;
                            selectedPlants?.map(item => {
                                if (item?.systemId == currSystem) {
                                    isSysPlantExists = true;
                                }
                            })
                            if (isSysPlantExists == true) {
                                return true;
                            }
                            return false;
                        }

                        else if (requestType == "3") {
                            let isSysPlantExists = false;
                            selectedPlants?.map(item => {
                                if (item?.systemId == currSystem && item?.repositoryPlantStatusId == "9") {
                                    isSysPlantExists = true;
                                }
                            })
                            if (isSysPlantExists == true) {
                                return true;
                            }
                            return false;
                        }

                        else {
                            return false;
                        }
                    } else if (currentView == "Repository") {
                        if (repoSubmitFor == "Modify") {
                            let isSysPlantExists = false;
                            selectedPlants?.map(item => {
                                if (item?.systemId == currSystem && item?.repositoryPlantStatusId == "9") {
                                    isSysPlantExists = true;
                                }
                            })
                            if (isSysPlantExists == true) {
                                return true;
                            }
                            return false;
                        } else if (repoSubmitFor == "Extend") {
                            let isSysPlantExists = false;
                            selectedPlants?.map(item => {
                                if (item?.systemId == currSystem) {
                                    isSysPlantExists = true;
                                }
                            })
                            if (isSysPlantExists == true) {
                                return true;
                            }
                            return false;
                        } else {
                            return false;
                        }
                    }
                    return false;
                }
                return false;
            },

            fnSetEditEnabilityForAdditionalData: function (basicDataVal, MM_LANGUAGE) {
                if (MM_LANGUAGE == "Z1") {
                    return false;
                }
                if (basicDataVal === true || basicDataVal === "Yes" || basicDataVal === "yes") {
                    return true;
                }
                return false;
            },

            markForSyndicationVisibility: function (requestType, wfTaskType) {
                // Draft or System Extension
                if ((requestType == "1" || requestType == "6") && wfTaskType == s_WF_GMDM) {
                    return true;
                }
                return false;
            },

            markForSyndicationEnability: function (requestSystemStatusId) {
                if (requestSystemStatusId == id_MS_Syndicated || requestSystemStatusId == id_MS_Not_Applicable) {
                    return false;
                }
                return true;
            },

            // onSetLastSynchronizedValue: function (MM_LAST_SYNCHRONIZED_MARA_DATS) {
            //     if (MM_LAST_SYNCHRONIZED_MARA_DATS == "0") {
            //         return null;
            //     } else {
            //         return MM_LAST_SYNCHRONIZED_MARA_DATS;
            //     }
            // },

            onSetBooleanValue: function (bValue) {
                if (bValue === false || bValue === undefined || bValue === "") {
                    return false;
                }
                return true;
            },

            //Additional Data
            fnSetDeleteEnabilityForAdditionalData: function (sValue, MM_LANGUAGE, MM_NEWLY_ADDED, isModified, descMandatory, descMandatoryLanguage, requestTypeId, wfTaskType, currentView) {
                if (MM_LANGUAGE == "Z1") {
                    return false;
                }

                if ((isModified && requestTypeId == 3 && !MM_NEWLY_ADDED) || (isModified && currentView == "Repository" && !MM_NEWLY_ADDED)) {
                    return false;
                }

                if (sValue === "Yes" && descMandatory) {
                    if (
                        (Array.isArray(descMandatoryLanguage) || typeof descMandatoryLanguage === "string") &&
                        descMandatoryLanguage.includes(MM_LANGUAGE)
                    ) {
                        return false;
                    }
                }

                if (sValue === true || sValue === "Yes" || sValue === "yes") {
                if (MM_NEWLY_ADDED == false && wfTaskType == s_WF_GMDM) {
                        return false;
                    } 
                    return true;
                }

                return false;
            },

            //Repository
            getMaterialStatusText: function (materialStatusId, materialStatusData) {
                try {
                    let mappedObj = materialStatusData.find(obj =>
                        obj.MM_KEY == materialStatusId
                    );
                    return mappedObj.MM_MATERIAL_STATUS_DESCRIPTION;
                } catch {
                    return null;
                }
            },

            //Repository Advance Filter Drop down - change text at view level 
            returni18Name: function (sValue) {
                return this?.geti18nText(sValue);
            },

            changeFilterTextValue: function (attribute_value) {
                let oResourceBundle = this?.getView()?.getModel("i18n")?.getResourceBundle();
                if (oResourceBundle?.hasText(attribute_value)) {
                    return this?.geti18nText(attribute_value);
                } else {
                    return attribute_value;
                }
            },

            // getFieldNameFromi18OrAttributeService: function (fieldName, attributeListProdData) {
            //     let oResourceBundle = this?.getView()?.getModel("i18n")?.getResourceBundle();

            //     if (fieldName?.includes("Full_Path") || fieldName?.includes("Other")) {
            //         if (fieldName?.includes("Full_Path")) {
            //             fieldName = fieldName?.replace(/(_Full_Path)$/, '');
            //             if (oResourceBundle?.hasText(fieldName)) {
            //                 return (this?.geti18nText(fieldName) + " " + this?.geti18nText("FullPath") );
            //             }
            //             else {
            //                 let fieldNameValue = (attributeListProdData?.find(item => item?.attribute == fieldName))?.attribute_value;
            //                 return (this?.geti18nText(fieldNameValue) + " " + this?.geti18nText("FullPath") );
            //             }
            //         }
            //         else if (fieldName?.includes("Other")) {
            //             fieldName = fieldName?.replace(/(_Other)$/, '');
            //             if (oResourceBundle?.hasText(fieldName)) {
            //                 return (this?.geti18nText(fieldName) + " " + this?.geti18nText("Other") );
            //             }
            //             else {
            //                 let fieldNameValue = (attributeListProdData?.find(item => item?.attribute == fieldName))?.attribute_value;
            //                 return (this?.geti18nText(fieldNameValue) + " " + this?.geti18nText("Other") );
            //             }
            //         }
            //     }

            //     else if (oResourceBundle?.hasText(fieldName)) {
            //         return this?.geti18nText(fieldName);
            //     } else {
            //         let fieldNameValue = (attributeListProdData?.find(item => item?.attribute == fieldName))?.attribute_value;
            //         return this?.geti18nText(fieldNameValue);
            //     }

            // },

            getFieldNameFromi18OrAttributeService: function (fieldName, attributeListProdData) {
                let oResourceBundle = this?.getView()?.getModel("i18n")?.getResourceBundle();
                const suffixMap = {
                    "_Full_Path": "FullPath",
                    "_Other": "Other"
                };

                for (let suffix in suffixMap) {
                    if (fieldName?.includes(suffix)) {
                        let baseFieldName = fieldName.replace(new RegExp(`${suffix}$`), '');
                        let translatedField = oResourceBundle?.hasText(baseFieldName)
                            ? this.geti18nText(baseFieldName)
                            : this.geti18nText(attributeListProdData?.find(item => item?.attribute === baseFieldName)?.attribute_value);

                        return `${translatedField} ${this.geti18nText(suffixMap[suffix])}`;
                    }
                }

                return oResourceBundle?.hasText(fieldName)
                    ? this.geti18nText(fieldName)
                    : this.geti18nText((attributeListProdData?.find(item => item?.attribute === fieldName)?.attribute_value) || fieldName);
            },

            massDownloadBtnVisibility: function (requestStatus) {
                if (requestStatus == "1") {
                    return true;
                }
                return false;
            },

            fnMassDownloadReqDataVisibility: function (uiView, requestStatus, requestType) {
                if (requestType == "4" || requestType == "7" || requestType == "8") {
                    return false;
                }
                if (uiView == "Basic_Data_1" || uiView == "Basic_Data_2" || uiView == "Add_Data_UoM") {
                    return false;
                }
                if (requestStatus == "1") {
                    return true;
                }
                return false;
            },

            changeMassUploadBtnText: function (wfTaskType) {
                if (wfTaskType === "MassRequest_GMDM_WF_Task") {
                    return this?.geti18nText("reUpload");
                } else {
                    return this?.geti18nText("upload");
                }
            },

            massUploadBtnVisibility: function (wfTaskType, requestStatus) {
                if (requestStatus == "1") {
                    return true;
                }
                else if (wfTaskType == "MassRequest_GMDM_WF_Task") {
                    return true;
                }
                return false;
            },

            massAttributesVisibility: function (uiView, requestType) {
                if (uiView === "Add_Data_Desc" || uiView === "Add_Data_Basic_Data_Text" || uiView === "Alternate_Id" || uiView === "Plant_Data" || uiView === "System_Data" || requestType == "4" || requestType == "7" || requestType == "8") {
                    return false;
                } else {
                    return true;
                }
            },

            fnVisibleMassTargetSystem: function (requestStatus, attachmentCount, uiView, isUserRequestOwner, wfTaskType) {
                if (!isUserRequestOwner && wfTaskType == s_WF_Requestor && requestStatus == "1") {
                    return false;
                }
                if (attachmentCount) {
                    return false;
                }
                if (requestStatus != "1") {
                    return false;
                }
                if (uiView == "Product_Data" || uiView == "Alternate_Id") {
                    return false;
                }
                return true;
            },

            fnSetMassUploadSystemRequired: function (uiView) {
                if (uiView == "Product_Data" || uiView == "Alternate_Id") {
                    return false;
                }
                return true;
            },

            fnMassUploadFieldEnability: function (requestStatus, attachmentcount, isUserRequestOwner, wfTaskType) {
                if (!isUserRequestOwner && wfTaskType == s_WF_Requestor && requestStatus == "1") {
                    return false;
                }
                if (!attachmentcount && requestStatus == "1") {
                    return true;
                }
                return false;
            },

            geti18nName: function (name) {
                let oResourceBundle = this?.getView()?.getModel("i18n")?.getResourceBundle();
                return oResourceBundle?.getText(name);
            },

            materialCopyBtnVisible: function (checkBoxSelected) {
                return checkBoxSelected;
            },

            materialProceedBtnVisible: function (checkBoxSelected) {
                return !checkBoxSelected;
            },

            saveAndCopyBtnVisible: function (checkBoxSelected) {
                return checkBoxSelected;
            },

            saveWithoutCopyBtnVisible: function (checkBoxSelected) {
                return !checkBoxSelected;
            },

            //plant
            getPlantDescText: function (plantId, plantData) {
                try {
                    let mappedObj = plantData.find(obj =>
                        obj.MM_KEY == plantId
                    );
                    return mappedObj.MM_PLANT_REF_LIST_DESC;
                } catch {
                    return null;
                }
            },

            getPlantIdCode: function (plantId, plantData) {
                try {
                    let mappedObj = plantData?.find(obj =>
                        obj.MM_KEY == plantId
                    );
                    return mappedObj.MM_PLANT_REF_LIST_CODE;
                } catch (e) {
                    return null;
                }
            },

            getPlantSpecificMatStatusText: function (plantSpecificMatStatus, systemID, oDataLookupList) {
                try {
                    let plantSpecificMatStatusList = oDataLookupList[systemID]?.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE,
                        mappedObj = plantSpecificMatStatusList?.find(obj =>
                            obj.MaterialStatus == plantSpecificMatStatus
                        )
                    return mappedObj?.Description;
                } catch {
                    return null;
                }
            },

            fnGetPlantActiveStatusText: function (plantId, plantRefList, plantActiveStatusList) {
                try {
                    let mappedObj = null,
                        plantActiveID = plantRefList.find(obj =>
                            obj.MM_KEY == plantId
                        )?.MM_PLANT_ACTIVE;
                    mappedObj = plantActiveStatusList.find(obj =>
                        obj.MM_KEY == plantActiveID
                    );
                    return mappedObj.MM_PLANT_ACTIVE;
                } catch {
                    return null;
                }
            },

            // getPlantActiveStatusText: function (plantActiveID, plantActiveStatusList) {
            //     try {
            //         let mappedObj = plantActiveStatusList.find(obj =>
            //             obj.MM_KEY == plantActiveID
            //         );
            //         return mappedObj.MM_PLANT_ACTIVE;
            //     } catch {
            //         return null;
            //     }
            // },

            //Workflow Action 
            fnVisible_Rework: function (SelectedTabKey, wfTaskType) {
                if (SelectedTabKey !== "materialList") {
                    return false;
                }
                if (wfTaskType == "Requester_Rework_WF_Task") {
                    return true;
                }
                return false;
            },

            fnEnable_Rework: function (materialList) {
                try {
                    for (let material of materialList) {
                        if (material.materialStatusId == id_MS_Inprogress && !material.validated)
                            return false;
                    }
                    return true;
                }
                catch (e) { }
            },

            fnEnable_Approve_ML: function (wfTaskType, materialList) {
                try {
                    if (wfTaskType == s_WF_GMDM || wfTaskType == s_WF_Rework)
                        for (let material of materialList) {
                            if (!material.validated) {
                                return false;
                            }
                        }
                    return true;
                }
                catch (e) { }
            },

            fnEnable_Complete_ML: function (wfTaskType, materialList, requestType) {
                try {
                    for (let material of materialList) {
                        if (requestType == 1 && wfTaskType === s_WF_GMDM) {
                            if (!(material.materialStatusId == id_MS_Commited_To_Repo_NotSyndicated || material.materialStatusId == id_MS_Commited_To_Repo_SyndicatedError || material.materialStatusId == id_MS_Syndicated || material.materialStatusId == id_MS_Excluded || material.materialStatusId == id_MS_SyndicationFailed)) {
                                return false;
                            }
                        }
                        else {
                            if (!material.validated) {
                                return false;
                            }
                        }
                    }
                }
                catch (e) { }
            },

            fnEnanle_Reject_ML: function (materialList) {
                try {
                    for (let material of materialList) {
                        if (material.materialStatusId == id_MS_Commited_To_Repo_NotSyndicated || material.materialStatusId == id_MS_Commited_To_Repo_SyndicatedError || material.materialStatusId == id_MS_Syndicated || material.materialStatusId == id_MS_SyndicationFailed)
                            return false;
                    }
                    return true;
                }
                catch (e) { }
            },

            fnEnable_ReturnToRequestor_ML: function (materialList) {
                try {
                    for (let material of materialList) {
                        if (material.materialStatusId == id_MS_Inprogress)
                            return true;
                    }
                    return false;
                }
                catch (e) { }
            },

            fnVisible_SystemSaveAsDraft: function (wfTaskType, materialStatusId, currentView, isUserRequestOwner) {
                if ((currentView == "CreateProject") && (wfTaskType === s_WF_Requestor) && (materialStatusId == id_MS_Draft || materialStatusId == null) && isUserRequestOwner) {
                    return true;
                }
                else if ((currentView == "CreateProject") && (wfTaskType === s_WF_GMDM || wfTaskType === s_WF_Rework) && (materialStatusId == id_MS_Inprogress)) {
                    return true;
                }
                return false;
            },

            fnVisible_SystemInclude: function (wfTaskType, requestType) {
                if (wfTaskType === s_WF_Requestor || wfTaskType === s_WF_GMDM || wfTaskType === s_WF_Rework || wfTaskType === s_WF_GQMD) {
                    return true;
                }
                return false;
            },

            fnVisible_requestNo: function (currentView) {
                if (currentView == "Repository") {
                    return false;
                }
                return true;
            },

            // Alt Uom
            fnAltUomAddButtonEnable: function (currentView, wfTaskType, requestType, materialStatusId, repoSubmitFor, isUserRequestOwner, repositorySystemStatusId, isEditable) {
                if (currentView == "CreateProject") {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if (requestType == "1") {
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated) || (wfTaskType === s_WF_GQMD && materialStatusId != id_MS_Syndicated)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else if (requestType == "3") {
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft) && (isEditable === true || isEditable === "Yes" || isEditable === "yes"))) {
                            return true;
                        } 
                        else if((wfTaskType === s_WF_GMDM || wfTaskType === s_WF_Rework) && (isEditable === true || isEditable === "Yes" || isEditable === "yes")) {
                            return true;
                        }    
                        else {
                            return false;
                        }
                    }
                    else if (requestType == "2" || requestType == "6") {
                        if (repositorySystemStatusId != id_MS_Syndicated && ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated) || (wfTaskType === s_WF_GQMD && materialStatusId != id_MS_Syndicated))) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else if (currentView == "Repository") {
                    if (repoSubmitFor == "Modify" || (repoSubmitFor == "Extend" && !repositorySystemStatusId)) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            },

            fnAltUomEditButtonEnable: function (currentView, wfTaskType, requestType, materialStatusId, repoSubmitFor, isUserRequestOwner, repositorySystemStatusId, isEditable) {
                if (currentView == "CreateProject") {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if (requestType == "1") {
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else if (requestType == "3") {
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress && (isEditable === true || isEditable === "Yes" || isEditable === "yes")) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated && (isEditable === true || isEditable === "Yes" || isEditable === "yes"))) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else if (requestType == "2" || requestType == "6") {
                        if (repositorySystemStatusId != id_MS_Syndicated && ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated))) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else if (currentView == "Repository") {
                    if (repoSubmitFor == "Modify") {
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            },

            fnAltUomDelButtonEnable: function (currentView, wfTaskType, requestType, materialStatusId, repoSubmitFor, altUnit, baseUnit, isNewlyAdded, isUserRequestOwner, repositorySystemStatusId, isModified, isEditable) {
                // if (isNewlyAdded == false) {
                //     return false;
                // }
                if ((isModified && requestType == 3 && !isNewlyAdded) || (isModified && currentView == "Repository" && !isNewlyAdded)) {
                    return false;
                }
                if (baseUnit && (altUnit == baseUnit)) {
                    return false;
                }
                if (currentView == "CreateProject") {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if (requestType == "1" || requestType == "3") {
                        if ((wfTaskType === s_WF_Requestor && isEditable && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && isEditable &&  materialStatusId == id_MS_Inprogress && isNewlyAdded) || (wfTaskType === s_WF_GMDM && isEditable && materialStatusId != id_MS_Syndicated && isNewlyAdded) || (wfTaskType === s_WF_GQMD && isEditable && materialStatusId != id_MS_Syndicated)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else if (requestType == "2" || requestType == "6") {
                        if (repositorySystemStatusId != id_MS_Syndicated && isEditable && ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated) || (wfTaskType === s_WF_GQMD && materialStatusId != id_MS_Syndicated))) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else if (currentView == "Repository") {
                    if (repoSubmitFor == "Modify") {
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            },

            actionBtnAddNewUomVisibility: function (isBtnClicked) {
                if (isBtnClicked == true) {
                    return true;
                } else {
                    return false;
                }
            },

            delBtnAddNewUomVisibility: function (intialRowIndex) {
                if (intialRowIndex == "0") {
                    let MaterialDetails = this.getModelDetails("MaterialDetails");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/altUomListItem/intialRowIndex", "");
                    return false;
                } else {
                    return true;
                }
            },

            fnAltUomDefaultRowEditability: function (altUnit, baseUnit) {
                if (baseUnit && (altUnit == baseUnit)) {
                    return false;
                }
                return true;
            },

            fnAltUnitFieldEditability: function (altUnit, baseUnit, editUomBtnClicked) {
                if ((baseUnit && (altUnit == baseUnit) || editUomBtnClicked)) {
                    return false;
                }
                return true;
            },

            //alternate id
            getAlternateIdTypeText: function (altId, listOfAlternateId) {
                try {
                    let altDesc = listOfAlternateId.find(element => element.MM_KEY == altId);
                    if (altDesc)
                        return altDesc.MM_ALTERNATE_ID_TYPE_REF_LIST_DESC;
                    else return altId;
                }
                catch (e) { }
            },

            getAlternateIdFieldText: function (fieldName, listOfFieldName) {
                try {
                    let field = listOfFieldName.find(element => element.MM_KEY == fieldName);
                    if (field)
                        return field.MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST_CODE;
                    else return fieldName;
                }
                catch (e) { }
            },

            getAlternateIdCountry: function (countryKey, countryList) {
                try {
                    let country = countryList.find(element => element.MM_KEY == countryKey);
                    if (country)
                        return country.MM_COUNTRY_REF_LIST_DESC;
                    else return countryKey;
                }
                catch (e) { }
            },

            getAlternateIdTypeCountryCode: function (countryKey, countryList) {
                try {
                    let country = countryList.find(element => element.MM_KEY == countryKey);
                    if (country)
                        return country.MM_COUNTRY_REF_LIST_CODE;
                    else return countryKey;
                }
                catch (e) { }
            },

            tabVisibilityDocsComments: function (materialListId, currentView) {
                if (materialListId || currentView == "Repository") {
                    return true;
                } else {
                    return false;
                }
            },

            fnSetVisibleReqSysStatusCol: function (currentView) {
                if (currentView == "Repository") {
                    return false;
                }
                return true;
            },

            fnSetVisibleRepoStatusCol: function (currentView) {
                if (currentView == "Repository") {
                    return true;
                }
                return false;
            },

            fnGetLabelNameForRepoMAterialStatus: function (currentView) {
                let oResourceBundle = this?.getView()?.getModel("i18n")?.getResourceBundle(),
                    labelName = null;
                if (currentView == "CreateProject") {
                    labelName = oResourceBundle.getText("repoMaterialStatusAtReqCrt");
                }
                else {
                    labelName = oResourceBundle.getText("repoMaterialStatus");
                }
                return labelName;
            },

            fnGetLabelNameForRepoPlantStatus: function (currentView) {
                let oResourceBundle = this?.getView()?.getModel("i18n")?.getResourceBundle();
                return currentView == "CreateProject" ? oResourceBundle.getText("repoPlantSyndicationStatusAtReqCrt") : oResourceBundle.getText("repoPlantSyndicationStatus");
            },

            fnGetLabelNameForRepoSystemStatus: function (currentView) {
                let oResourceBundle = this?.getView()?.getModel("i18n")?.getResourceBundle();
                return currentView == "CreateProject" ? oResourceBundle.getText("repoSystemSyndicationStatusAtReqCrt") : oResourceBundle.getText("repoSystemSyndicationStatus");
            },

            fnHandleEnableForPlantData: function (editFor, isEdit, plantListForRequestSpecificModify, plantId, plantRefList, requestPlantStatus, repoPlantStatus, wfTaskType, repoSubmitFor, isIncluded) {
                let that = this,
                    CreateProject = this.getModelDetails("CreateProject"),
                    Repository = this.getModelDetails("Repository"),
                    requestStatus = CreateProject.getProperty("/RequestHeader/data/requestStatus"),
                    requestType = CreateProject.getProperty("/RequestHeader/data/requestType"),
                    viewName = that.gViewName;

                //Include button in Repository Extend Case
                if (viewName === "Repository" && editFor == 'isIncluded') {
                    if (repoSubmitFor === "Extend" && repoPlantStatus) {
                        return true;
                    }
                    return false;
                }
                //Special Case for Requestor in Change and Extend Scenario - to include plants of Committed to Repo Status
                if (editFor == 'isIncluded' && wfTaskType == s_WF_Requestor && (requestPlantStatus == id_MS_Not_Selected || requestPlantStatus == id_MS_Draft)) {
                    //for Modify
                    // if (requestType == 3 && (repoPlantStatus == id_MS_Syndicated || repoPlantStatus == id_MS_Commited_To_Repo_SyndicatedError || repoPlantStatus == id_MS_Commited_To_Repo_NotSyndicated))
                    //     return true;
                    //for Extend
                    if (requestType == 2 && requestStatus == 1 && (repoPlantStatus == id_MS_Syndicated || repoPlantStatus == id_MS_Commited_To_Repo_SyndicatedError || repoPlantStatus == id_MS_Commited_To_Repo_NotSyndicated))
                        return true;
                }
                if (isEdit) {
                    if (viewName === "Repository" && repoSubmitFor === "Extend") {
                        switch (editFor) {
                            case "editPlant":
                                if (isIncluded) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            case "deletePlant":
                                if (repoPlantStatus) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                        }
                    }
                    if (requestPlantStatus == id_MS_Draft || requestPlantStatus == id_MS_Inprogress || requestPlantStatus == id_MS_Commited_To_Repo_SyndicatedError || requestPlantStatus == id_MS_Commited_To_Repo_NotSyndicated) {
                        // if (requestType == 3) {
                        //     if (wfTaskType = s_WF_Requestor) {
                        //         return true;
                        //     }
                        //     else {
                        //         var plantCode = null;
                        //         if (plantId && plantListForRequestSpecificModify) {
                        //             let plantCodefn = function () {
                        //                 let mappedObj = plantRefList?.find(obj =>
                        //                     obj.MM_KEY == plantId
                        //                 );
                        //                 return mappedObj.MM_PLANT_REF_LIST_CODE;
                        //             };
                        //             plantCode = plantCodefn();
                        //         }
                        //         if (plantListForRequestSpecificModify.includes(plantCode)) {
                        //             return true;
                        //         }
                        //     }
                        // }
                        // else {
                        if (wfTaskType == s_WF_Requestor || wfTaskType == s_WF_GMDM || wfTaskType == s_WF_Rework) {
                            switch (editFor) {
                                case "deletePlant":
                                    if (repoPlantStatus != id_MS_Syndicated && repoPlantStatus != id_MS_Commited_To_Repo_SyndicatedError && repoPlantStatus != id_MS_Commited_To_Repo_NotSyndicated)
                                        return true;
                                    break;
                                default:
                                    return true;
                            }
                        }
                    }
                }
                return false;
            },

            fnHandleEnableforSystemData: function (editFor, isEdit, systemListForRequestSpecific, systemID, requestSystemStatusId, repoSystemStatusId, wfTaskType) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    requestType = CreateProject.getProperty("/RequestHeader/data/requestType");
                //Special Case for Requestor in Change and Extend Scenario - to include plants of Committed to Repo Status
                if (editFor == 'isIncluded' && wfTaskType == s_WF_Requestor && requestSystemStatusId == id_MS_Draft) {
                    //for Modify
                    if (requestType == 3 && (repoSystemStatusId == id_MS_Syndicated || repoSystemStatusId == id_MS_Commited_To_Repo_SyndicatedError || repoSystemStatusId == id_MS_Commited_To_Repo_NotSyndicated))
                        return true;
                    //for Extend
                    if (requestType == 2 && (repoSystemStatusId == id_MS_Commited_To_Repo_SyndicatedError || repoSystemStatusId == id_MS_Commited_To_Repo_NotSyndicated))
                        return true;
                }
                if (isEdit) {
                    if (requestSystemStatusId == id_MS_Draft || requestSystemStatusId == id_MS_Inprogress || requestSystemStatusId == id_MS_Commited_To_Repo_SyndicatedError || requestSystemStatusId == id_MS_Commited_To_Repo_NotSyndicated) {
                        if (requestType == 3) { // Modify
                            if (wfTaskType = s_WF_Requestor) {
                                switch (editFor) {
                                    case "editSystem":
                                        if (repoSystemStatusId != id_MS_Syndicated) {
                                            return true;
                                        }
                                        break;
                                    default:
                                        return true;
                                }
                            }
                            else {
                                if (systemID && systemListForRequestSpecific) {
                                    if (systemListForRequestSpecific.includes(systemID)) {
                                        switch (editFor) {
                                            case "editSystem":
                                                if (repoSystemStatusId != id_MS_Syndicated) {
                                                    return true;
                                                }
                                                break;
                                            default:
                                                return true;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (wfTaskType == s_WF_Requestor || wfTaskType == s_WF_GMDM || wfTaskType == s_WF_Rework || wfTaskType == s_WF_GQMD) {
                                switch (editFor) {
                                    case "deleteSystem":
                                        if (repoSystemStatusId != id_MS_Syndicated && repoSystemStatusId != id_MS_Commited_To_Repo_SyndicatedError && repoSystemStatusId != id_MS_Commited_To_Repo_NotSyndicated)
                                            return true;
                                        break;
                                    default:
                                        return true;
                                }
                            }
                        }
                    }
                }
                return false;
            },

            fnGetSystemVisibleClErrorFrag: function (errorFor) {
                if (errorFor == 'system') {
                    return true;
                }
                return false;
            },

            fnGetPlantVisibleClErrorFrag: function (errorFor) {
                if (errorFor == 'plant') {
                    return true;
                }
                return false;
            },

            alternateTableButtonsEnable: function (wfTaskType, materialStatusId) {
                if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId == id_MS_Inprogress)) {
                    return true;
                }
                else {
                    return false;
                }
            },

            toEnableIncludeColumn: function (included, materialStatusId, wfTaskType, requestType, selectedPath, materialListId) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    selectedMaterialListId = CreateProject.getProperty(selectedPath)?.materialListId;
                if (!included) {
                    return false;
                }

                // GMDM & InProgress
                if (wfTaskType === "GMDM_WF_Task" && materialStatusId == 2 && selectedMaterialListId == materialListId) {
                    return true;
                }
                //GQMD & Blocked For Create scneario
                if (wfTaskType === "GQMD_WF_Task" && materialStatusId == 11 && requestType == 1 && selectedMaterialListId == materialListId) {
                    return true;
                }
                //GQMD & Inprogress For Modify scneario
                if (wfTaskType === "GQMD_WF_Task" && materialStatusId == 2 && requestType == 3 && selectedMaterialListId == materialListId) {
                    return true;
                }
                return false;
            },

            advFilterPlaceHolderText: function (searchType) {
                switch (searchType) {
                    case "equals":
                        return this?.geti18nText("placeholderEquals");
                    case "notEquals":
                        return this?.geti18nText("placeholderEquals");
                    case "contains":
                        return this?.geti18nText("placeholderContains");
                    case "notContains":
                        return this?.geti18nText("placeholderContains");
                    case "existIn":
                        return this?.geti18nText("placeholderExistsIn");
                    case "doesNotExistIn":
                        return this?.geti18nText("placeholderExistsIn");
                }
            },

            getBaseUomKey: function (baseUomCode, baseUomRefList) {
                try {
                    let baseUom = baseUomRefList.find(element => element.MM_UOM_REF_LIST_CODE == baseUomCode);
                    if (baseUom)
                        return baseUom.MM_KEY;
                    else return null;
                }
                catch (e) { }
            },

            fnVisible_BasicDataTabs: function (requestType, currentView, repoMaterialStatusId, repoSubmitFor) {
                if (requestType == 3 && currentView == "CreateProject" && (repoMaterialStatusId == id_MS_Commited_To_Repo_NotSyndicated || repoMaterialStatusId == id_MS_Commited_To_Repo_SyndicatedError)) {
                    return false;
                }
                else if (repoSubmitFor != "Extend" && currentView == "Repository" && (repoMaterialStatusId == id_MS_Commited_To_Repo_NotSyndicated || repoMaterialStatusId == id_MS_Commited_To_Repo_SyndicatedError)) {
                    return false;
                }
                else {
                    return true;
                }
            },

            getVisibleForRepoitory: function (currentView) {
                if (currentView === "Repository") return false;
                return true;
            },

            onSetSelectedItemForTree: function (currentNodeID, selectedNodeId) {
                if (currentNodeID)
                    return currentNodeID == selectedNodeId;
                return false;
            },

            getLiveryDescription: function (livery, listOfLivery) {
                try {
                    let liveryDesc = listOfLivery.find(element => element.MM_KEY == livery);
                    if (liveryDesc)
                        return liveryDesc.MM_LIVERY_REF_LIST_DESC;
                    else return livery;
                }
                catch (e) { }
            },

            getESignRemarksDescription: function (eSignRemark, listOfRemarks) {
                try {
                    let remarkDesc = listOfRemarks.find(element => element.MM_KEY == eSignRemark);
                    if (remarkDesc)
                        return remarkDesc.MM_ESIGN_REMARKS_REF_LIST_DESC;
                    else return remarkDesc;
                }
                catch (e) { }
            },

            handleMaterialDocumentCommentCaseTabName: function (currentView, a, b) {
                if (currentView === "Repository") return b;
                return a;
            },

            // classification tab visibility
            fnVisible_Classification: function (requestType, currentView, repoMaterialStatusId, repoSubmitFor) {
                if ((currentView == "CreateProject") && !(repoMaterialStatusId == id_MS_Commited_To_Repo_NotSyndicated || repoMaterialStatusId == id_MS_Commited_To_Repo_SyndicatedError)) {
                    if (requestType == "3") {
                        return true;
                    }
                    return false;
                } else if (currentView == "Repository") {
                    if ((repoSubmitFor && !(!repoMaterialStatusId || repoMaterialStatusId == id_MS_Commited_To_Repo_NotSyndicated || repoMaterialStatusId == id_MS_Commited_To_Repo_SyndicatedError)) || !repoSubmitFor) {
                        return true;
                    }
                    return false;
                }
                return false;
            },
            // classification delete enability
            fnClassificationDeleteEnability: function (isNewlyAdded, currentView, wfTaskType, requestType, materialStatusId, repoSubmitFor, isUserRequestOwner) {
                if (isNewlyAdded == false) {
                    return false;
                }
                if (currentView == "CreateProject") {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if (requestType == "3") {
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated) || (wfTaskType === s_WF_GQMD && materialStatusId != id_MS_Syndicated)) {
                            return true;
                        }
                        return false;
                    } else {
                        return false;
                    }
                } else if (currentView == "Repository") {
                    if (repoSubmitFor == "Modify") {
                        return true;
                    }
                    return false;
                }
                return false;
            },
            // classification buttons enability
            fnClassificationAddButtonEnable: function (currentView, wfTaskType, requestType, materialStatusId, repoSubmitFor, isUserRequestOwner, isEditPerformed, isNewAddedClass) {
                if (currentView == "CreateProject") {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if (requestType == "3") {
                        if (isEditPerformed == true || isNewAddedClass == true) {
                            return false;
                        }
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft))) {
                            return true;
                        }
                        return false;
                    } else {
                        return false;
                    }
                } else if (currentView == "Repository") {
                    if (repoSubmitFor == "Modify") {
                        if (isEditPerformed == true || isNewAddedClass == true) {
                            return false;
                        }
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            },

            fnClassificationEditEnability: function (currentView, wfTaskType, requestType, materialStatusId, repoSubmitFor, isUserRequestOwner, isEditPerformed, editSelectedClassNum, classnum, isNewAddedClass) {
                if (currentView == "CreateProject") {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if (requestType == "3") {
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated) || (wfTaskType === s_WF_GQMD && materialStatusId != id_MS_Syndicated)) {
                            if (isEditPerformed == false) {
                                return true;
                            } else {
                                if (editSelectedClassNum == classnum) {
                                    return true;
                                }
                                return false;
                            }
                        }
                        return false;
                    } else {
                        return false;
                    }
                } else if (currentView == "Repository") {
                    if (repoSubmitFor == "Modify") {
                        if (isEditPerformed == false) {
                            return true;
                        } else {
                            if (editSelectedClassNum == classnum) {
                                return true;
                            }
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                return false;
            },

            fnClassificationEditVisibility: function (classNum, systemId, allowedClasses) {

                try {
                    let allowedClassesInSystem = allowedClasses[systemId];  //Get the allowed classes for this system
                    return allowedClassesInSystem.includes(classNum);

                } catch (e) {
                    return false;
                }
            },


            fnReqCommentFeedInputEnable: function (currentView, wfTaskType, createProjectRequestStatus, createMassRequestStatus, isUserRequestOwnerCreatProj, isUserRequestOwnerCreatMass) {
                if (((currentView == "CreateProject" && !isUserRequestOwnerCreatProj) || (currentView == "CreateMassRequest" && !isUserRequestOwnerCreatMass)) && wfTaskType == s_WF_Requestor) {
                    return false;
                }
                if ((wfTaskType == s_WF_Requestor && ((currentView == "CreateProject" && createProjectRequestStatus != "1") || (currentView == "CreateMassRequest" && createMassRequestStatus != "1")))) {
                    return false;
                }
                return true;
            },

            fnMatCommentFeedInputEnable: function (currentView, wfTaskType, requestType, materialStatusId, repoSubmitFor, isUserRequestOwner, repositorySystemStatusId) {
                if (currentView == "CreateProject") {
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if ((wfTaskType == s_WF_Requestor && (materialStatusId && materialStatusId != id_MS_Draft))) {
                        return false;
                    }
                    return true;
                } else if (currentView == "Repository") {
                    if (repoSubmitFor == "EditDocument" || repoSubmitFor == "Modify" || repoSubmitFor == "Extend") { // 792 ticket
                        return true;
                    }
                    return false;
                } else {
                    return false;
                }
            },

            fnReqHeaderPriorityEditable: function (requestStatus, isUserRequestOwner) {
                if (requestStatus == "1" && isUserRequestOwner) {
                    return true;
                }
                return false;
            },

            fnWeightUnitRequired: function (currentView, wfTaskType) {
                if (currentView == "CreateProject" && (wfTaskType == s_WF_Requestor || wfTaskType == s_WF_Rework)) {
                    return false;
                } else if ((currentView == "CreateProject" && wfTaskType == s_WF_GMDM) || currentView == "Repository") {
                    return true;
                }
                return false;
            },

            fnVisibleActionFooter: function (isUserRequestOwner, wfTaskType) {
                try {
                    if (!isUserRequestOwner && wfTaskType === s_WF_Requestor) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                catch (e) { }
            },

            fnVisibleDeleteActionFooter: function (isUserRequestOwner, btpRoles, requestStatus) {
                if (requestStatus != 1) {
                    return false;
                }
                if (!isUserRequestOwner && btpRoles?.includes("z-MDG-MM-Administrator")) {
                    return true;
                }
                return false;
            },

            fnVisibleRepoActionColumn: function (userRole) {
                try {
                    if (userRole?.includes("Repository Edit")) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                catch (e) { }
            },

            onGetDateFormat: function (timestamp) {
                if (timestamp == null || timestamp === "") return "";
                const date = new Date(timestamp);

                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                const day = String(date.getUTCDate()).padStart(2, '0');
                const hours = String(date.getUTCHours()).padStart(2, '0');
                const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                const seconds = String(date.getUTCSeconds()).padStart(2, '0');

                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            },

            fnChngLogSummaryVisible: function (currentView) {
                if (currentView == "Repository") {
                    return false;
                }
                return true;
            },

            attributeChangePanelVisible: function (currentView) {
                if (currentView === "Repository") {
                    return true;
                }
                else {
                    return false;
                }
            },
            
            getVisibleRowCount: function (inputArray) {
                if (!Array.isArray(inputArray)) return 1;
                return inputArray.length > 5 ? 5 : inputArray.length;
            },

            altIdStatusModifier: (wfTaskType, isVisible, currentView)=>{
                if(!isVisible) return false;
                if (currentView === "Repository") {
                    return true;
                }
                return wfTaskType !== "Request_Form_Submission"
            },
             getMarketCodes: function (aDest) {
                if (!Array.isArray(aDest) || aDest.length === 0) return "";
                return aDest.map(item => item.code).join(", ");
            }
        }
    }
);