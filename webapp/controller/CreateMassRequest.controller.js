sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/viatris/materialmaster/controller/BaseController",
    "com/viatris/materialmaster/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, BaseController, formatter) {
        "use strict";

        return BaseController.extend("com.viatris.materialmaster.controller.CreateMassRequest", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.resourceBundle = this.getModelDetails("i18n").getResourceBundle();
                this.oRouter.getRoute("CreateMassRequest").attachPatternMatched(this._onRouteMatched, this);
                var MassRequest = this.getModelDetails("MassRequest");
                // let presentDate = new Date(),
                //     MM_requestHeaderMassUpdateDateRequired = this.byId("MM_requestHeaderMassUpdateDateRequired");
                // if (MM_requestHeaderMassUpdateDateRequired) {
                //     MM_requestHeaderMassUpdateDateRequired.setMinDate(presentDate);
                // }
                if (!MassRequest.getProperty("/fromMassRequestPage")) {
                    this.navigateTo("MassRequest");
                }
            },

            _onRouteMatched: async function (oEvent) {
                var that = this,
                    oAppModel = this.getModelDetails("oAppModel"),
                    lookupModel = this.getModelDetails("LookupModel"),
                    currentUser = oAppModel.getProperty("/userdetails/userMailID"),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    createdBy = CreateMassRequest.getProperty("/RequestHeader/data/createdBy"),
                    isUserRequestOwner = createdBy == currentUser ? true : false;
                CreateMassRequest.setProperty("/isUserRequestOwner", isUserRequestOwner);
                oAppModel.setProperty("/sideNavigation/icon/MassRequest", "sap-icon://checklist-2");
                oAppModel.setProperty("/sideNavigation/setSelectedKey", "PageMassRequest");
                CreateMassRequest.setProperty("/selectedMassRequestTab", "requestHeader");
                var requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber");
                lookupModel.setProperty("/MassRequest/attributeList", []);
                if (requestNumber) {
                    this.fnGetMassAttachmentByRequestNumber(requestNumber, "CreateMassRequest");
                    this.fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId(requestNumber, null, null, "CreateMassRequest", false, true);
                    this.getWorkflowDetails(requestNumber, "CreateMassRequest", "materialmassuploadworkflow");
                } else {
                    //this.onUpdateMassUploadModel("CreateMassRequest");
                    //set null
                    CreateMassRequest.setProperty("/MassUpload/templateRef/uiView", null);
                    CreateMassRequest.setProperty("/MassUpload/templateRef/attributesList", []);
                    CreateMassRequest.setProperty("/MassUpload/templateRef/systemId", null);
                    CreateMassRequest.setProperty("/MassUpload/documentsRef/documentsList", []);
                    CreateMassRequest.setProperty("/MassUpload/documentsRef/attachmentcount", 0);
                    CreateMassRequest.setProperty("/MassUpload/templateRef/syndicationState", true);

                    let CreateMassRequestLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/CreateMassRequest.json"),
                        CreateMassRequestLocalModel = new JSONModel(),
                        CreateMassRequestLocalModelData;

                    that.getView().setModel(CreateMassRequestLocalModel, "CreateMassRequestLocalModel");
                    await CreateMassRequestLocalModel.loadData(CreateMassRequestLocation);

                    CreateMassRequestLocalModelData = CreateMassRequestLocalModel.getData();
                    let workflowdata = CreateMassRequestLocalModelData?.WorkflowDetails;
                    workflowdata["processDetails"]["status"] = "Workflow not started";

                    CreateMassRequest.setProperty("/WorkflowDetails", workflowdata);

                    this.onUpdateNewDocCommentModel("CreateMassRequest");
                    this.onUpdateWorkflowDetailsModel("CreateMassRequest");
                }
                CreateMassRequest.setProperty("/DocComments/reqLevelComments/newComment", null);
                CreateMassRequest.setProperty("/MassUploadMandFields/valueState", {});
                this.onLoadingCountrySetData();
                CreateMassRequest.refresh();

            },
            // add delegate is adding custom method to control, another onAfterRendering will trigger when it gets oFileUploader
            // browseButton is retrieving the hidden input inside fileUploader control
            // based on condition is stopping to open default select dialog
            onAfterRendering: function () {
                let that = this,
                    oFileUploader = this.byId("massFileUploader");
                oFileUploader.addDelegate({
                    onAfterRendering: function () {
                        var browseButton = oFileUploader.getDomRef("fu");
                        $(browseButton).on("click", function (event) {
                            if(!this.fnCheckMandatoryValidation()){
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                let errorMsg = that.resourceBundle.getText("errorMessageMandatory"),
                                actions = ["OK"];
                                that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                                });
                            }

                        }.bind(this));
                    }.bind(this)
                })
            },

            getRequestSource: function () {
                return "Mass_Request";
            },

            getViewName: function () {
                return "CreateMassRequest";
            },

            //Press Icon Tab Bar
            onPressIconTabBar: function (oEvent) {
                var SelectedTabKey = oEvent.getParameter("key"),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                    selectedMassRequestTab = CreateMassRequest.getProperty("/selectedMassRequestTab"),
                    actionFooterVisibility = CreateMassRequest.getProperty("/ActionFooter/visibility"),
                    s_WF_Mass_GMDM = "MassRequest_GMDM_WF_Task";

                switch (selectedMassRequestTab) {
                    case "massUpload":
                        if (wfTaskType == s_WF_Mass_GMDM) {
                            actionFooterVisibility.approve = true,
                                actionFooterVisibility.reject = true
                        }
                        break;
                }
                CreateMassRequest.setProperty("/ActionFooter/visibility", actionFooterVisibility);

                CreateMassRequest.setProperty("/selectedMassRequestTab", SelectedTabKey);
                if (SelectedTabKey === "docsComments") {
                    var requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber");
                    if (requestNumber) {
                        this.fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId(requestNumber, null, null, "CreateMassRequest", false, true);
                    }
                }
            },

            /***********************REQUEST HEADER*****************************/
            onMU_saveRequestHeader: function () {
                var that = this,
                    oView = this.getView(),
                    isValid,
                    oAppModel = this.getModelDetails("oAppModel"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    lookupData = LookupModel.getData(),
                    requestHeaderData = CreateMassRequest.getProperty("/RequestHeader/data"),
                    oldRequestHeaderDto = CreateMassRequest.getProperty("/RequestHeader/oldData"),
                    currenttime = this.onGetCurrentDate("HH:mm:ss"),
                    createdOn,
                    currentUser = oAppModel.getProperty("/userdetails/userMailID"),
                    currentDate = this.onGetCurrentDate("yyyy-mm-dd"),
                    requestSource = this.getRequestSource(),
                    requestPayload = {}, inputValidateArray, reqHeaderEditability;
                currentDate = currentDate + " " + currenttime;
                createdOn = requestHeaderData.createdOn + " " + currenttime;

                reqHeaderEditability = {
                    "materialType": false,
                    "requestType": false,
                    "reqSubType": false
                };
                inputValidateArray = [
                    {
                        "path": "/RequestHeader/valueState/requestType",
                        "value": requestHeaderData.requestType,
                        "items": lookupData.massRequestType,
                        "parameter": "MM_KEY",
                        "type": "combobox"
                    },
                    {
                        "path": "/RequestHeader/valueState/materialType",
                        "value": requestHeaderData.materialType,
                        "items": lookupData.materialType,
                        "parameter": "MM_KEY",
                        "type": "combobox"
                    },
                    {
                        "path": "/RequestHeader/valueState/requestDescription",
                        "value": requestHeaderData.requestDescription,
                        "type": "input"
                    }
                ];

                //validate mandatory fields
                isValid = this.validateInputData("CreateMassRequest", inputValidateArray);

                if (isValid) {
                    if (requestHeaderData) {
                        var updatedRequestHeaderDto = {
                            "changedBy": currentUser, // requestHeaderData.changedBy,
                            "changedOn": currentDate, // requestHeaderData.changedOn, //changedOn
                            "createdBy": requestHeaderData.createdBy, //createdByEmail,mass
                            "createdOn": requestHeaderData.createdOn,
                            // "dateRequired": requestHeaderData.dateRequired,
                            "requestSubTypeId": null, //parseInt(requestHeaderData.reqSubType),
                            "materialTypeId": parseInt(requestHeaderData.materialType),
                            "requestDescription": this.onTrim(requestHeaderData.requestDescription),
                            "requestStatusId": parseInt(requestHeaderData.requestStatus),
                            "requestTypeId": parseInt(requestHeaderData.requestType),
                            "scenario": requestHeaderData.scenario,
                            "uiView": null,
                            "priority": requestHeaderData.priority || false,
                            "requestNumber": requestHeaderData.requestNumber,
                            "requestSource": requestSource,
                            "isDeleted": false,
                            "isMassUploadRequest": true
                        };
                        requestPayload = {
                            "oldRequestHeaderDto": oldRequestHeaderDto,
                            "updatedRequestHeaderDto": updatedRequestHeaderDto
                        };
                        //Call Srv
                        that.openBusyDialog();
                        that.fnProcessDataRequest("MM_JAVA_MASS/createRequestHeader", "POST", null, true, requestPayload,
                            function (responseData) {
                                let result = responseData?.result;
                                if (result) {
                                    let requestNo = result.requestNumber,
                                        actions = ["OK"],
                                        successMsg = "Request No - " + requestNo + " " + that.resourceBundle.getText("succesMsgToSaveReqHeaderData");
                                    CreateMassRequest.setProperty("/RequestHeader/data/requestNumber", requestNo);
                                    CreateMassRequest.setProperty("/RequestHeader/data/changedBy", currentUser);
                                    CreateMassRequest.setProperty("/RequestHeader/data/changedOn", currentDate);
                                    CreateMassRequest.setProperty("/RequestHeader/editable", reqHeaderEditability);
                                    CreateMassRequest.setProperty("/RequestHeader/data/scenario", 2);//Making scenario to 2 as soon as confirm header is pressed .. (To avoid multiple updates on request number)
                                    CreateMassRequest.setProperty("/RequestHeader/oldData", JSON.parse(JSON.stringify(updatedRequestHeaderDto))); //Update the Old Value to Latest data posted in DB
                                    CreateMassRequest.setProperty("/RequestHeader/savedData", JSON.parse(JSON.stringify(requestHeaderData))); //Update the Old Value to Latest data posted in DB for dirty flag
                                    that.showMessage(successMsg, "S", actions, "OK", function (action) {
                                        CreateMassRequest.setProperty("/selectedMassRequestTab", "massUpload"); //navigation to orgdata after saving the requestheader
                                    });
                                }
                                that.closeBusyDialog();
                            },
                            function (responseData) {
                                let errorMsg = that.resourceBundle.getText("errorMsgToSaveData") + "Request Header Data",
                                    actions = ["OK"];
                                that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                                });
                                that.closeBusyDialog();
                            });
                    }
                } else {
                    let errorMsg = this.geti18nText("errorMessageMandatory"),
                        actions = ["OK"];
                    that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                    });
                    that.closeBusyDialog();
                }
            },
            //REQUEST TYPE : SELECT EVENT
            onSelectMassRequestType: function (oEvent) {
                this.onLiveCheckField(oEvent);
            },
            onSelectMassMaterialType: function (oEvent) {
                this.onLiveCheckField(oEvent);
            },
            onLiveCheckMassRequestDesc: function (oEvent) {
                this.onLiveCheckField(oEvent);
            },
            onSelectMassSystemId: function (oEvent) {
                this.onLiveCheckField(oEvent);
            },
            onSelectAttributeList: function (oEvent) {
                let CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    sValues = CreateMassRequest.getProperty("/MassUpload/templateRef/attributesList");
                if (!sValues?.length) {
                    oEvent?.getSource()?.setValueState("Error");
                } else {
                    oEvent?.getSource()?.setValueState("None");
                }
            },
            // onLiveMassCheckRequiredDate: function (oEvent) {
            //     this.onLiveCheckField(oEvent);
            //     var presentDate = this.onGetCurrentDate("yyyy-mm-dd")
            //     var requiredDateValue = oEvent.getSource().getValue();
            //     if (presentDate > requiredDateValue) {
            //         oEvent.getSource().setValue("");
            //     }
            // },
            //Change : UI View Type
            onSelectedViewType: function (oEvent) {
                let that = this,
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    materialTypeId = CreateMassRequest.getProperty("/RequestHeader/data/materialType"),
                    requestTypeId = CreateMassRequest.getProperty("/RequestHeader/data/requestType"),
                    sKey = oEvent.getSource().getSelectedKey(),
                    sUrl = "MM_JAVA_MASS/getAttributesList",
                    LookupModel = this.getModelDetails("LookupModel"), requestSource, oPayload;
                    if(requestTypeId == "4"){
                        requestSource = "Mass_Create"
                    }else if(requestTypeId == "5"){
                        requestSource = "Mass_Update"
                    }

                    oPayload = {
                        "materialTypeId": materialTypeId,
                        "uiView": sKey,
                        "requestSource": requestSource
                    };
                this.onLiveCheckField(oEvent);
                // this.fnHandleComboboxValidation(oEvent);
                LookupModel.setProperty("/MassRequest/attributeList", []);
                CreateMassRequest.setProperty("/MassUpload/templateRef/attributesList", null);
                CreateMassRequest.setProperty("/MassUpload/templateRef/systemId", null);
                if(sKey){
                    that.openBusyDialog();
                    this.fnProcessDataRequest(sUrl, "POST", null, false, oPayload,
                        function (responseData) {
                            LookupModel.setProperty("/MassRequest/attributeList", responseData.attributeList);
                            that.closeBusyDialog();
                        },
                        function (error) {
                            LookupModel.setProperty("/MassRequest/attributeList", []);
                            that.closeBusyDialog();
                        }
                    );
                }
            },

            fnCheckMandatoryValidation: function () {
                var CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    MassUploadMandFieldsMapping = CreateMassRequest.getProperty("/MassUploadMandFields/MassUploadMandFieldsMapping"),
                    uiView = CreateMassRequest.getProperty("/MassUpload/templateRef/uiView"),
                    attributeList = CreateMassRequest.getProperty("/MassUpload/templateRef/attributesList"),
                    targetSystem = CreateMassRequest.getProperty("/MassUpload/templateRef/systemId"),
                    requestType = CreateMassRequest.getProperty("/RequestHeader/data/requestType"),
                    isValidated = true;
                CreateMassRequest.setProperty("/MassUploadMandFields/valueState", {});

                if (!uiView) {
                    uiView = "";
                }
                if(requestType == "5"){ // Mass Update
                    MassUploadMandFieldsMapping?.map(item => {
                        if (uiView == item?.uiView) {
                            if (!uiView) {
                                isValidated = false;
                                CreateMassRequest.setProperty("/MassUploadMandFields/valueState/uiView", "Error");
                            }
                            if (item?.isMandAttributes == true && !attributeList?.length) {
                                isValidated = false;
                                CreateMassRequest.setProperty("/MassUploadMandFields/valueState/attributeList", "Error");
                            }
                            if (item?.isMandSystem == true && !targetSystem) {
                                isValidated = false;
                                CreateMassRequest.setProperty("/MassUploadMandFields/valueState/targetSystem", "Error");
                            }
                        }
                    })
                }else if(requestType == "4" || requestType == "7" || requestType == "8"){ // Mass Create
                    if(!targetSystem){
                        isValidated = false;
                        CreateMassRequest.setProperty("/MassUploadMandFields/valueState/targetSystem", "Error");
                    }
                }
                return isValidated;
            },

            //DOWNLOAD TEMPLATE
            onDownloadTemplate: function () {
                this.fnDownloadTemplateReport("MM_JAVA_MASS/exportEmptyTemplateExcel");
            },

            fnDownloadTemplateReport: function (sUrl) {
                var that = this,
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    materialType = CreateMassRequest.getProperty("/RequestHeader/data/materialType"),
                    UploadTemplateData = CreateMassRequest.getProperty("/MassUpload/templateRef"),
                    allmaterialType = LookupModel.getProperty("/materialType"),
                    requestTypeId = (CreateMassRequest.getProperty("/RequestHeader/data/requestType")).toString(),
                    materialTypeDesc = null,
                    requestPayload, attributeList, viewId,
                    countryKeyLookUp = this.fnCreateCountrySetMassDownloadPayload();
                try {
                    let mappedMaterialObj = allmaterialType.find(obj =>
                        obj.MM_KEY == materialType
                    );
                    materialTypeDesc = mappedMaterialObj.MM_MATERIAL_TYPE_SAP_CODE;
                }
                catch (e) { }

                if (!this.fnCheckMandatoryValidation()) {
                    let errorMsg = that.resourceBundle.getText("errorMessageMandatory"),
                        actions = ["OK"];
                    that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                    });
                    return;
                }

                // if (!UploadTemplateData?.uiView || (!UploadTemplateData?.attributesList?.length && UploadTemplateData?.uiView !== "Add_Data_Desc" && UploadTemplateData?.uiView !== "Add_Data_Basic_Data_Text" && UploadTemplateData?.uiView !== "Alternate_Id")) {
                //     let errorMsg = that.resourceBundle.getText("errorMessageMandatory"),
                //         actions = ["OK"];
                //     that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                //     });
                //     return;
                // }

                attributeList = this.fnGetSelectedAttributesMassUpload();

                switch(requestTypeId){
                    case "4":
                        viewId = "Mass Create";
                        break;
                    case "5":
                        viewId = UploadTemplateData.uiView;
                        break;
                    case "7":
                        viewId = "Mass System Extension";
                        break;
                    case "8":
                        viewId = "Mass Plant Extension";
                        break;
                    default:
                        viewId = null;
                        break;
                }

                requestPayload = {
                    "countryKeyLookUp": countryKeyLookUp,
                    "materialType": materialTypeDesc || null,
                    "viewId": viewId,
                    "attributeList": attributeList, //UploadTemplateData.attributesList   
                    "systemId": UploadTemplateData?.systemId || null,
                    "markForSyndication": UploadTemplateData?.syndicationState 
                };
                //Call Srv
                that.openBusyDialog();
                that.fnProcessDataRequest(sUrl, "POST", null, true, requestPayload,
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
                    function (oError) {
                        that.showMessage(that.resourceBundle.getText("downloadFailed"));
                        that.closeBusyDialog();
                    }
                );
            },

            // fnBeforeSelectDialog: function (oEvent) {
            //     // oEvent.bPreventDefault=true;
            //     let that = this,
            //         oFileUploader = this.byId("massFileUploader");
            //     var $browseButton = oFileUploader.$("button");
            //     $browseButton.on("click", function (event) {
            //         event.stopImmediatePropagation();
            //         // Prevent the file dialog from opening
            //         sap.m.MessageToast.show("File selection is disabled.");
            //     });
            // },
            //FILE UPLOADER : CHANGE EVENT
            uploadCompleteMassData: function (oEvent) {
                this.fnUploadComplete("CreateMassRequest", oEvent, "massFileUploader");
            },
            //MASS UPLOAD : ACTION BUTTON
            onUploadMassData: function (oEvent) {
                let CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber");

                // code to restrict duplicate files upload
                // selectedFileName = CreateMassRequest.getProperty("/DocComments/documents/attachedDocument/file")?.name,
                // documentList = CreateMassRequest.getProperty("/MassUpload/documentsRef/documentsList"),
                // that = this,
                // isFileExists = false,
                // oFileUploader = that.byId("massFileUploader");
                // documentList.map(item => {
                //     if(item.documentName === selectedFileName){
                //         isFileExists = true;
                //         let errorMsg = '"' + selectedFileName + '"' + " " + that.resourceBundle.getText("duplicateFileErrorMsg");
                //         that.showMessage(errorMsg, "E", ["OK"], "OK", function (action) {
                //             oFileUploader.clear();
                //         });
                //     }
                // })
                // if(!isFileExists){
                //     this.fnUploadFileAttach("CreateMassRequest", requestNumber, null, null, false);
                // }
                this.fnUploadFileAttach("CreateMassRequest", requestNumber, null, null, false);
            },

            onDownloadDocumentFile: function (oEvent) {
                this.openBusyDialog();
                this.fnDownloadFileContent(oEvent, "docCommentModel");
            },
            onDownloadMassExcelFile: function (oEvent) {
                this.openBusyDialog();
                this.fnDownloadFileContent(oEvent, "CreateMassRequest");
            },
            //Upload doc and comments tab
            onUploadFileAttach: function (oEvent) {
                let CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber") || 16;
                this.fnUploadFileAttach("CreateMassRequest", requestNumber, null, null, true);
            },
            onDeleteDocument: function (oEvent) {
                let CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber") || 16;
                this.fnDeleteDocument(requestNumber, null, null, oEvent, "CreateMassRequest");
            },

            onPostReqLevelComments: function (oEvent) {
                let CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    comments = oEvent.getParameter("value"),
                    isReqLevel = true,
                    requestNumber = this.onGetRequestNo();
                this.fnPostComments(requestNumber, null, null, "CreateMassRequest", comments, isReqLevel);
            },
            //COMMENTS AND DOCUMENTS
            UploadComplete: function (oEvent) {
                this.fnUploadComplete("CreateMassRequest", oEvent, "fileUploader");
            },

            /* Save Mass Upload Data */
            onSaveMassUpload: function () {
                let that = this,
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    uiView = CreateMassRequest.getProperty("/MassUpload/templateRef/uiView"),
                    requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber"),
                    materialType = CreateMassRequest.getProperty("/RequestHeader/data/materialType"),
                    requestType = (CreateMassRequest.getProperty("/RequestHeader/data/requestType")).toString(),
                    targetSystemId = CreateMassRequest.getProperty("/MassUpload/templateRef/systemId"),
                    syndicationState = CreateMassRequest.getProperty("/MassUpload/templateRef/syndicationState"),
                    UploadTemplateData = CreateMassRequest.getProperty("/MassUpload/templateRef"),
                    selectedAttributes = this.fnGetSelectedAttributesMassUpload(),
                    savePayload, viewId;

                    switch(requestType){
                        case "4":
                            viewId = "Mass Create";
                            break;
                        case "5":
                            viewId = UploadTemplateData?.uiView;
                            break;
                        case "7":
                            viewId = "Mass System Extension";
                            break;
                        case "8":
                            viewId = "Mass Plant Extension";
                            break;
                        default:
                            viewId = null;
                            break;
                    }

                    savePayload = {
                        "attributeList": selectedAttributes || null,
                        "massRequestReUpload": false,
                        "materialType": parseInt(materialType) || null,
                        "requestNumber": parseInt(requestNumber) || null,
                        "targetSystemId": parseInt(targetSystemId) || null,
                        "uiView": viewId,
                        "markForSyndication": syndicationState
                    }
                this.fnProcessDataRequest("MM_JAVA/saveMassUpload", "POST", null, true, savePayload,
                    function (responseData) {
                        that.fnGetMassAttachmentByRequestNumber(requestNumber, "CreateMassRequest");
                        that.closeBusyDialog();
                    },
                    function (Error) {
                        that.closeBusyDialog();
                    }
                )
            },

            /*****************Submit Request: onSubmitRequest ************/
            onSubmitRequest: function () {
                let CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber");
                //trigger workflow if mass upload file exist
                let massUploadFileList = CreateMassRequest.getProperty("/MassUpload/documentsRef/documentsList");
                if (!massUploadFileList.length) {
                    var errorMsg = this.geti18nText("massUploadError"),
                        actions = ["OK"];
                    this.showMessage(errorMsg, "E", actions, "OK", function (action) {
                    });
                } else {
                    this.fnTriggerMassWFValidation(requestNumber);
                }

            },
            fnTriggerMassWFValidation: function (requestNumber) {
                let that = this,
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    requestType = CreateMassRequest.getProperty("/RequestHeader/data/requestType"),
                    materialType = CreateMassRequest.getProperty("/RequestHeader/data/materialType");
                that.fnGetWFValidatedContext(materialType, requestType, requestNumber, "MassRequestPage");

            },

            onUpdateMassUploadModel: function (modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    massDocumentData = modelDetails.getProperty("/MassDocumentsUpload"),
                    massDocumentModel = this.getView().getModel("massDocumentModel");
                if (!massDocumentModel) {
                    massDocumentModel = new JSONModel();
                    this.getView().setModel(massDocumentModel, "massDocumentModel");
                }
                massDocumentData.usedFor = modelDetails;
                massDocumentModel.setData(massDocumentData);
                massDocumentModel.refresh(true);
            },
            /***********************BACK NAVIGATION********************* */

            onGoBackMassRequest: function (oEvent) {

                // if (this.hasMassRequestDataChanges()) {
                //     var confirmMsg = this.geti18nText("unsavedDataLoss");
                //     this.showMessage(confirmMsg, "W", ["NO", "YES"], "YES", function (action) {
                //         if (action === "YES") {
                //             this.navigateTo("MassRequest");
                //         }
                //         else {
                //         }
                //     }.bind(this)
                //     );
                // }
                // else {
                //     this.navigateTo("MassRequest");
                // }
                this.navigateTo("MassRequest");
            },
            // hasMassRequestDataChanges: function () {
            //     var CreateMassRequest = this.getModelDetails("CreateMassRequest"),
            //         reqHeaderOldData = CreateMassRequest.getProperty("/RequestHeader/savedData"),
            //         reqHeaderNewData = CreateMassRequest.getProperty("/RequestHeader/data"),
            //         requestStatus = CreateMassRequest.getProperty("/RequestHeader/data/requestStatus"),
            //         uiView = CreateMassRequest.getProperty("/MassUpload/templateRef/uiView"),
            //         attachmentCount = CreateMassRequest.getProperty("/MassUpload/documentsRef/attachmentcount");


            //     if (reqHeaderOldData) {
            //         delete reqHeaderOldData.changedOn
            //         delete reqHeaderOldData.changedBy
            //         delete reqHeaderNewData.changedOn
            //         delete reqHeaderNewData.changedBy
            //         if (!(this.compareObjects(reqHeaderOldData, reqHeaderNewData))) {
            //             return true;
            //         }
            //     }

            //     return (requestStatus === 1 && uiView && !attachmentCount)
            // },
            onApproveTask: function () {
                var wfAction = 2; //For Approve
                this.onOpenCommentsPopScreen(wfAction);
            },
            onRejectTask: function (oEvent) {
                var wfAction = 5; // for Reject
                this.onOpenCommentsPopScreen(wfAction);
            },
            onRefreshMassWorkflow: function () {
                var CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber");
                this.getWorkflowDetails(requestNumber, "CreateMassRequest", "materialmassuploadworkflow");
            },
            ondownloadMassRequestData: function () {
                this.fnDownloadTemplateReport("MM_JAVA_MASS/massDownloadExcel");
            },
            fnCreateCountrySetMassDownloadPayload: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    countryList = LookupModel.getProperty("/CountryCode"),
                    countryListPayload;
                countryListPayload = countryList?.map(item => ({
                    countryKey: item?.CountryKey,
                    countryName: item?.Name
                }));
                return countryListPayload || null;
            }
        });
    });