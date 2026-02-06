sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/viatris/materialmaster/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */

    function (Controller, JSONModel, MessageBox, MessageToast, formatter, Filter, FilterOperator, Fragment) {
        "use strict";
        return Controller.extend("com.viatris.materialmaster.controller.BaseController", {
            //   formatter: formatter,
            _debounceTimers: {},
            onInit: function () {
                this.resourceBundle = this.getModelDetails("i18n").getResourceBundle();
            },

            onGetResolvedURI: function () {
                this.sResolvedURI = this.getOwnerComponent().getManifestObject().resolveUri("");
                this.sResolvedURI = this.sResolvedURI === "./" ? "" : this.sResolvedURI;
            },

            navigateTo: function (navigateTo) {
                var oAppModel = this.getModelDetails("oAppModel"),
                    currentView = navigateTo;
                oAppModel.setProperty("/sideNavigation/currentView", currentView);
                return this.getOwnerComponent().getRouter().navTo(navigateTo);
            },

            fnGetCurrentUserMailID: function () {
                let oAppModel = this.getModelDetails("oAppModel");
                return oAppModel.getProperty("/userdetails/userMailID") || null;
            },

            getModelDetails: function (modelName) {
                return this.getOwnerComponent().getModel(modelName);
            },

            getBaseURL: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                return appModulePath;
            },

            onAddingMandatoryValue: function (oEvent) {
                oEvent.getSource()?.setValueState(sap.ui.core.ValueState.None);
            },

            initBusyDialog: function () {
                this._BusyDialog = new sap.m.BusyDialog({
                    busyIndicatorDelay: 0,
                    customIconRotationSpeed: 0,
                });
            },

            openBusyDialog: function () {
                if (!this._BusyDialog) {
                    this.initBusyDialog();
                }
                this._BusyDialog.open();
            },

            closeBusyDialog: function () {
                if (!this._BusyDialog) {
                    this.initBusyDialog();
                }
                this._BusyDialog.close();
            },

            fnToGetRequestSource: function (viewName) {
                if (viewName == "CreateProject") {
                    return "Request_Management"
                } else if (viewName == "Repository") {
                    return "Repository"
                }
                return viewName;
            },

            ongetCreatedBy: function () {
                let LookupModel = this.getModelDetails("LookupModel"),
                    viewName = this.getViewName(),
                    requestSource = "";
                switch (viewName) {
                    case "RequestManagement":
                        requestSource = "Request_Management";
                        break;
                    case "MassRequest":
                        requestSource = "Mass_Request";
                        break;
                }
                this.fnProcessDataRequest("MM_JAVA/getUserDetails?requestSource=" + requestSource, "GET", null, true, null, function (responseData) {
                    if (responseData) {
                        LookupModel.setProperty("/createdBy", responseData);
                    }
                },
                    function (responseData) {

                    });
            },

            onSetTimeOut: function (milliSeconds) {
                return new Promise(resolve => setTimeout(resolve, milliSeconds));
            },

            onGetDateConvertFormat: function (date, format) {
                let currentDate = new Date(date),
                    day = "" + currentDate.getUTCDate(),
                    month = "" + (currentDate.getUTCMonth() + 1),
                    year = "" + currentDate.getUTCFullYear(),
                    hours = "" + currentDate.getUTCHours(),
                    mins = "" + currentDate.getUTCMinutes(),
                    secs = "" + currentDate.getUTCSeconds(),
                    monthName = "" + currentDate.toLocaleString("default", { month: "long" }).slice(0, 3),
                    dateFormat;
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;
                if (hours.length < 2)
                    hours = '0' + hours;
                if (mins.length < 2)
                    mins = '0' + mins;
                if (secs.length < 2)
                    secs = '0' + secs;
                switch (format) {
                    case "long":
                        dateFormat = Date.parse(currentDate)
                        break;
                    case "ymd":
                        dateFormat = year + "-" + month + "-" + day;
                        break;
                    case "mdy":
                        dateFormat = month + "/" + day + "/" + year;
                        break;
                    case "ymdhms":
                        dateFormat = year + "-" + month + "-" + day + " " + hours + ":" + mins + ":" + secs;
                        break;
                    case "MdyHms":
                        dateFormat = month + "/" + day + "/" + year + " " + hours + ":" + mins + ":" + secs;
                        break;
                    case "ddMMMyyyy":
                        dateFormat = day + " " + monthName + " " + year + " " + hours + ":" + mins + ":" + secs;
                        break;
                    case "yyyy-mm-dd HH:mm:ss":
                        dateFormat = year + "-" + month + "-" + day + " " + hours + ":" + mins + ":" + secs;
                        break;
                    case "yyyy-mm-dd":
                        dateFormat = year + "-" + month + "-" + day;
                        break;
                    case "HH:mm:ss":
                        dateFormat = hours + ":" + mins + ":" + secs;
                        break;
                }
                return dateFormat;
            },

            convertDateFormat: function (dateStr) {
                //For Changing "21.12.2022 16:28:51" format to "2022-12-21 16:28:51"
                let [datePart, timePart] = dateStr.split(" ");
                let [day, month, year] = datePart.split(".");

                return `${year}-${month}-${day} ${timePart}`;
            },

            onGetCurrentDate: function (format) {
                let currentDate = new Date();
                return this.onGetDateConvertFormat(currentDate, format);
            },

            onGetNullValue: function (value, type) {
                var data;
                if (type === "string") {
                    if (value === null || value === "" || value === undefined) {
                        data = null;
                    } else {
                        data = value;
                    }
                } else if (type === "int") {
                    if (value === null || value === "" || value === undefined) {
                        data = null;
                    } else {
                        data = parseInt(value);
                    }
                }
                else {
                    if (value === null || value === "" || value === undefined) {
                        data = 0
                    } else {
                        data = parseInt(value);
                    }
                }
                return data;
            },

            handleSelectedValue: function (oEvent) {
                if (oEvent.getSource().getValue() && oEvent.getSource().getSelectedKey() != "") {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }

                if (oEvent.getSource().getSelectedKey() === "") {
                    oEvent.getSource().setValue("");
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },

            showMessage: function (pMessage, pMsgTyp, pActions, pEmpAction, pHandler) {
                let actionList = { "YES": MessageBox.Action.YES, "NO": MessageBox.Action.NO, "OK": MessageBox.Action.OK, "COMPLETEREQUEST": "Complete Request", "CANCEL": "Cancel" },
                    actions = [], empAction = "";
                try {
                    if (!pMessage || pMessage.trim().length === 0) {
                        return;
                    }
                }
                catch (e) {
                    return;
                }

                if (pActions) {
                    for (let action of pActions) {
                        actions.push(actionList[action]);
                    }
                }
                empAction = actionList[pEmpAction];
                if (["A", "E", "I", "W", "S", "Q"].indexOf(pMsgTyp) === -1) {
                    sap.m.MessageToast.show(pMessage);
                }
                else {
                    let sIcon = "",
                        sTitle = "";
                    switch (pMsgTyp) {
                        case "W":
                            sIcon = "WARNING";
                            break;
                        case "E":
                            sIcon = "ERROR";
                            break;
                        case "I":
                            sIcon = "INFORMATION";
                            break;
                        case "A":
                            sIcon = "NONE";
                            break;
                        case "S":
                            sIcon = "SUCCESS"
                            break
                        case "Q":
                            sIcon = "QUESTION"
                            sTitle = "CONFIRMATION"
                        default:

                    }
                    if (sTitle === "") sTitle = sIcon;
                    MessageBox.show(pMessage, {
                        icon: sIcon,
                        title: sTitle,
                        actions: actions,
                        emphasizedAction: empAction,
                        onClose: pHandler,
                    });
                }
            },

            fnProcessDataRequest: function (sUrl, sReqType, oHeader, bShowBusy, requestPayload, aSuccessFunctionality, aErrorFunctionality, bSync = false) {
                let oAjaxSettings = {},
                    that = this;
                if (!this.sResolvedURI) {
                    this.onGetResolvedURI();
                }
                sUrl = this.sResolvedURI + sUrl;
                oAjaxSettings = {
                    url: sUrl,
                    method: sReqType,
                    contentType: "application/json",
                    async: !bSync,
                    beforeSend: function () {
                        if (bShowBusy) {
                            that.openBusyDialog();
                        }
                    },
                    complete: function (responsePayload, status) {
                        if ((status === "success" && (responsePayload.status === 200 || responsePayload.status === 201)) || responsePayload.status === 204 || responsePayload.status === 501) {
                            var response = {}, responseHeader = {};
                            if (responsePayload?.responseJSON?.statusCode === "500" || responsePayload?.responseJSON?.status === "Failure") {
                                let errMsg = responsePayload?.responseJSON?.error || responsePayload?.responseJSON?.responseMessage || "Error";
                                that.showMessage(errMsg, "E", ["OK"], "OK", function () {
                                });
                                aErrorFunctionality(responsePayload?.responseJSON);
                                if (bShowBusy) {
                                    that.closeBusyDialog();
                                }
                            }
                            else {
                                if (responsePayload.responseJSON) {
                                    response = responsePayload.responseJSON;
                                    responseHeader = responsePayload;
                                    // just to avoid duplicate record creation where 204 status code is treated as success but it will return as failure
                                    if (responsePayload?.responseJSON?.statusCode == "204") {

                                    }
                                }
                                else if (responsePayload.responseText) {
                                    response = JSON.parse(responsePayload.responseText);
                                }
                                if (bShowBusy) {
                                    that.closeBusyDialog();
                                }
                                aSuccessFunctionality(response, responseHeader);
                            }
                        }
                        else {
                            if (responsePayload?.status === 500) {
                                let errMsg = responsePayload?.responseJSON?.error || responsePayload?.responseJSON?.responseMessage || "Error";
                                that.showMessage(errMsg, "E", ["OK"], "OK", function () {
                                    that.closeBusyDialog();
                                });
                            }
                            else if (responsePayload.responseJSON) {
                                aErrorFunctionality(responsePayload.responseJSON);
                            }
                            else if (responsePayload.responseText) {
                                try {
                                    aErrorFunctionality(JSON.parse(responsePayload.responseText));
                                }
                                catch (e) {
                                    aErrorFunctionality(responsePayload.responseText);
                                }
                            }
                            else {
                                aErrorFunctionality({});
                            }
                            if (bShowBusy) {
                                that.closeBusyDialog();
                            }
                        }
                    }
                };
                if (oHeader && oHeader instanceof Object) {
                    oAjaxSettings.headers = oHeader;
                }
                if (requestPayload && requestPayload instanceof Object) {
                    oAjaxSettings.dataType = "json";
                    oAjaxSettings.data = JSON.stringify(requestPayload);
                }
                $.ajax(oAjaxSettings);
            },

            fnLoadRequestFormsData: async function () {
                var createProjectModel = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    requestType = createProjectModel.getProperty("/RequestHeader/data/requestType"),
                    materialType = createProjectModel.getProperty("/RequestHeader/data/materialType"),
                    localRefModel = new sap.ui.model.json.JSONModel(),
                    requestFormLocData = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/RequestForm.json"),
                    refDataToLoad = null, secsVisible = false, refDataToLoadPath = "/", section1 = null, section2 = null, section3 = null, section4 = null, section5 = null, section6 = null;
                await localRefModel.loadData(requestFormLocData);
                if (requestType == 1) { //Create Scenario
                    if (materialType) {
                        switch (materialType) {
                            case "ZBLK":
                                refDataToLoad = "Bulk_Create";
                                break;
                            case "ZAPI":
                                refDataToLoad = "API_Create";
                                break
                            case "ZPPP":
                            case "FERT":
                                refDataToLoad = "ZAPP_Create";
                                secsVisible = true;
                                break;
                        }
                    }
                    else {
                        refDataToLoad = "Bulk_Create";
                    }
                }
                else if (requestType == 2 || requestType == 3) { // For Extend or Change Scenario
                    if (materialType) {
                        switch (materialType) {
                            case "ZBLK":
                                refDataToLoad = "Bulk_Change";
                                break;
                            case "ZAPI":
                                refDataToLoad = "API_Change";
                                break
                            case "ZPPP":
                            case "FERT":
                                refDataToLoad = "ZAPP_Change";
                                secsVisible = true;
                                break;
                        }
                    }
                    else {
                        refDataToLoad = "Bulk_Change";
                    }
                }
                else {
                    refDataToLoad = "Bulk_Create";
                }
                if (refDataToLoad) {
                    refDataToLoadPath += refDataToLoad;
                    section1 = localRefModel.getProperty(refDataToLoadPath + "/section1");
                    section2 = localRefModel.getProperty(refDataToLoadPath + "/section2");
                    section3 = localRefModel.getProperty(refDataToLoadPath + "/section3");
                    section4 = localRefModel.getProperty(refDataToLoadPath + "/section4");
                    section5 = localRefModel.getProperty(refDataToLoadPath + "/section5");
                    section6 = localRefModel.getProperty(refDataToLoadPath + "/section6");
                    MaterialDetails.setProperty("/RequestForm/section1/visible", section1);
                    MaterialDetails.setProperty("/RequestForm/section2/visible", section2);
                    MaterialDetails.setProperty("/RequestForm/section3/visible", section3);
                    MaterialDetails.setProperty("/RequestForm/section4/visible", section4);
                    MaterialDetails.setProperty("/RequestForm/section5/visible", section5);
                    MaterialDetails.setProperty("/RequestForm/section6/visible", section6);
                    //To make the Section 5 & 6 Visible only incase of FERT & ZAPP
                    MaterialDetails.setProperty("/RequestForm/section5/sectionVisible", secsVisible);
                    MaterialDetails.setProperty("/RequestForm/section6/sectionVisible", secsVisible);
                }
            },

            //Rules Call
            onLoadRequestSubtype: function (reqTypeID) {
                var lookupModel = this.getModelDetails("LookupModel"),
                    decisionTableName = "MM_SUB_REQUEST_TYPE_REF_LIST",
                    conditions = [{
                        "VIATRIS_MM_CONDITIONS.MM_REQUEST_TYPE": parseInt(reqTypeID) || null
                    }],
                    systemFilters = [{
                        "column": "MM_SUB_REQUEST_TYPE_REF_LIST.MM_ACTIVE",
                        "operator": "like",
                        "value": "Yes"
                    }],
                    systemOrders = {
                        "MM_SUB_REQUEST_TYPE_REF_LIST.MM_SUB_REQUEST_DESC": "ASC"
                    },
                    reqSubTypepayLoad = this.onGetRulePayload(decisionTableName, conditions, systemOrders, systemFilters);
                this.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, reqSubTypepayLoad,
                    function (responseData) {
                        var reqSubtype = responseData.data.result[0].MM_SUB_REQUEST_TYPE_REF_LIST;
                        lookupModel.setProperty("/reqSubType", reqSubtype);
                    },
                    function (error) { }
                );
            },

            onGetRulePayload: function (tableName, conditions = [], systemOrders = null, systemFilters = null) {
                let rulePayload = {
                    "decisionTableId": null,
                    "decisionTableName": tableName,
                    "version": "v1",
                    "rulePolicy": null,
                    "validityDate": null,
                    "conditions": conditions,
                    "systemFilters": systemFilters,
                    "systemOrders": systemOrders,
                    "filterString": null
                }
                return rulePayload;
            },

            LoadFragment: function (type, oView, toOpen = true) {
                return new Promise((resolve) => {
                    var oFragmentModel = this.getOwnerComponent().getModel("oFragmentModel");
                    let fragment = oFragmentModel.getProperty("/" + type);
                    if (!this._dialog) {
                        this._dialog = {}
                    }
                    if (!this._dialog[fragment.name]) {
                        this._dialog[fragment.name] = this.loadFragment({
                            name: fragment.name,
                        });
                    }
                    if (toOpen) { // To Open the fragment on top of View
                        this._dialog[fragment.name].then(function (oDialog) {
                            oView.addDependent(oDialog);
                            oDialog.open();
                            resolve(true);
                        });
                    }
                    else { // To render the fragment in the same view
                        resolve(this._dialog[fragment.name]); //by passing the fragment details
                    }
                })
            },

            validateInputData: function (model, userInputArray) {
                var isValid = true, flag = true,
                    oModel = this.getModelDetails(model);

                for (let item of userInputArray) {
                    let path = item['path'];

                    switch (item['type']) {
                        case "input":
                            if (item['value'] === null || item['value'] === undefined || item['value'] === "") {
                                oModel.setProperty(path, "Error");
                                isValid = false;
                            } else {
                                oModel.setProperty(path, "None");
                            }
                            break;

                        case "combobox":
                            if (item['value'] === null || item['value'] === undefined || item['value'] === "") {
                                oModel.setProperty(path, "Error");
                                isValid = false;
                            }
                            else {
                                var list = item['items'],
                                    parameter = item['parameter'];
                                for (var i = 0; i < list.length; i++) {
                                    let flag = true;
                                    if (parseInt(item['value']) === list[i][parameter]) {
                                        oModel.setProperty(path, "None");
                                        break;
                                    }
                                    else {
                                        oModel.setProperty(path, "Error");
                                        flag = false;
                                    }
                                }
                                if (flag === false) {
                                    isValid = false;
                                }
                            }
                            break;
                        case "date":
                            if (item['value'] === null || item['value'] === undefined || item['value'] === "") {
                                oModel.setProperty(path, "Error");
                                isValid = false;
                            }
                            else {
                                oModel.setProperty(path, "None");
                            }
                            break;
                    }
                }

                return isValid
            },

            onTrim: function (inputValue) {
                var trimmedValue;
                trimmedValue = inputValue ? inputValue.trim() : inputValue;
                return trimmedValue;
            },

            validateDate: function (date) {
                var regexPattern = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) (0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
                if (!regexPattern.test(date)) {
                } else {
                }
            },

            //---------------------------------------
            //Get text from i18n file
            //---------------------------------------
            geti18nText: function (sTextKey) {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                return oResourceBundle.getText(sTextKey);
            },

            stringToArray: function (inputStr) {
                if (inputStr) {
                    inputStr = inputStr.trim();

                    if (inputStr === '' || !(typeof (inputStr) == 'string')) {
                        return [];
                    }
                    return inputStr.split(',').map(item => item.trim());
                }
                else {
                    return [];
                }
            },

            arrayToString: function (inputArray) {
                if (!inputArray || (inputArray.length === 0)) {
                    return '';
                }
                else if (typeof (inputArray) === "string") {
                    return inputArray;
                }
                return inputArray.map(item => String(item).trim()).join(',');
            },


            sortMultiComboValues: function (fieldName, PP_SelectedKeys) {
                let LookupModel = this.getModelDetails("LookupModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    fieldDetails = this.onGetProductDataValue(fieldName),
                    selectedKeys = fieldDetails?.sValue,
                    fieldClassName = fieldDetails?.className,
                    selectedKeysPath = PP_SelectedKeys?.split(">")[1]?.slice(0, -1),
                    fieldRefList = LookupModel.getProperty(`/${fieldName}`),
                    refListName = MaterialDetails.getProperty(`/ProductData/${fieldClassName}/MM_LOOKUP_RULE_NAME/${fieldName}`),
                    refListDesc = `${refListName}_DESC`,
                    keyToDescMap = {};

                if (!fieldRefList || !selectedKeys || !selectedKeysPath) {
                    return;
                }

                for (let item of fieldRefList) {
                    let MM_KEY = item["MM_KEY"],
                        description = item[refListDesc];
                    if (MM_KEY !== undefined && description) {
                        keyToDescMap[MM_KEY] = description;
                    }
                }

                let sortedKeys = selectedKeys
                    .filter(key => keyToDescMap[key])
                    .sort((a, b) => keyToDescMap[a].localeCompare(keyToDescMap[b]));

                MaterialDetails.setProperty(selectedKeysPath, sortedKeys);
            },

            onLiveCheckField: function (oEvent) {
                var sValue = oEvent.getSource().getValue();
                if (sValue) {
                    oEvent.getSource().setValueState("None");
                } else {
                    oEvent.getSource().setValueState("Error");
                }
            },

            onGetProductDataValue: function (fieldName) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    productData = MaterialDetails.getProperty("/ProductData"),
                    fieldDetails = {};
                for (let className in productData) {
                    let classData = productData[className]?.data;
                    if (classData.hasOwnProperty(fieldName)) {
                        fieldDetails.sValue = classData[fieldName];
                        fieldDetails.className = className;
                        break;
                    }
                }
                return fieldDetails;
            },

            onSelectCheckbox: function (oEvent) {
                var oModelName = oEvent.getSource().getBindingInfo("selected").parts[0].model,
                    oModel = this.getModelDetails(oModelName),
                    selectedValue = oEvent.getParameter("selected"),
                    itemsBindingPath = oEvent.getSource().getBindingContext(oModelName).getPath(),
                    bindingPathCheckbox = oEvent.getSource().getBindingPath("selected"),
                    propertyPath = itemsBindingPath + "/" + bindingPathCheckbox;
                oModel.setProperty(propertyPath, selectedValue);
            },

            //Rules Call

            onLoadingMaterialStatusForRepo: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    that = this,
                    systemFilters = [{
                        "column": "MM_MATERIAL_STATUS_REF_LIST.MM_REPOSITORY",
                        "operator": "eq",
                        "value": "Yes"
                    },
                    {
                        "column": "MM_MATERIAL_STATUS_REF_LIST.MM_ACTIVE",
                        "operator": "like",
                        "value": "%Yes%"
                    }],
                    conditions = [
                        {
                            "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": 2000
                        }
                    ],
                    systemOrders = {
                        "MM_MATERIAL_STATUS_REF_LIST.MM_MATERIAL_STATUS_DESCRIPTION": "ASC"
                    },
                    payload = that.onGetRulePayload("MM_MATERIAL_STATUS_REF_LIST", conditions, systemOrders, systemFilters);
                that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                    function (responseData) {
                        let listOfMaterialStatuses = responseData?.data?.result[0]?.MM_MATERIAL_STATUS_REF_LIST;
                        LookupModel.setProperty("/MM_MATERIAL_STATUS_REF_LIST", listOfMaterialStatuses);
                    },
                    function (error) { }
                );
            },

            onLoadingMoleculeData: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    listOfAllMolecules = LookupModel.getProperty("/Molecule"),
                    that = this;
                if (!listOfAllMolecules) {
                    let conditions = [
                        {
                            "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": "*"
                        }
                    ],
                        systemOrders = {
                            "MM_MOLECULE_REF_LIST.MM_MOLECULE_REF_LIST_DESC": "ASC"
                        },
                        systemFilters = [
                            {
                                "column": "MM_MOLECULE_REF_LIST.MM_ACTIVE",
                                "operator": "like",
                                "value": "%Yes%"
                            }
                        ];
                    let payload = that.onGetRulePayload("MM_MOLECULE_REF_LIST", conditions, systemOrders, systemFilters);
                    that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                        function (responseData) {
                            listOfAllMolecules = responseData?.data?.result[0]?.MM_MOLECULE_REF_LIST;
                            LookupModel.setProperty("/Molecule", listOfAllMolecules);
                        },
                        function (error) { }
                    );
                }
                else {
                }
            },

            onReloadMaterialDetailJSON: function (viewName) {
                return new Promise(async (resolve) => {
                    var MaterialDetails = this.getModelDetails("MaterialDetails"),
                        localRefModel = new sap.ui.model.json.JSONModel(),
                        path = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MaterialDetails.json"),
                        productDataOutline = {};
                    await localRefModel.loadData(path);
                    var localRefModelData = localRefModel.getData();
                    MaterialDetails.setData(localRefModelData);
                    if (viewName === "CreateProject") {
                        let CreateProject = this.getModelDetails("CreateProject")
                        productDataOutline = CreateProject.getProperty("/productDataOutline");
                    }
                    if (viewName === "Repository") {
                        let Repository = this.getModelDetails("Repository"),
                            materialType = Repository.getProperty("/MaterialSelected/materialType");
                        productDataOutline = Repository.getProperty(`/ProductData/productDataOutline`);
                    }
                    if (productDataOutline != null || productDataOutline != undefined) {
                        MaterialDetails.setProperty("/ProductData", JSON.parse(JSON.stringify(productDataOutline)));
                    }
                    resolve(true);
                });
            },

            fnDirectPlantSync: async function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    oResponseForWFContext = MaterialDetails.getProperty("/GeneralData/wfContextAtGMDMTask/response"),
                    plantCodesForDirectSyndication = oResponseForWFContext?.plantCodesForDirectSyndication || [],
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    isSyndicatedVal = false,
                    isSyndicated = false,
                    that = this;
                that.openBusyDialog();
                if (plantCodesForDirectSyndication && plantCodesForDirectSyndication.length > 0) {
                    isSyndicatedVal = await that.fnToSyndicate(null, true, null, false, true, plantCodesForDirectSyndication);
                    if (isSyndicatedVal) {
                        isSyndicated = await that.fnToSyndicate(null, false, null, false, true, plantCodesForDirectSyndication);
                        if (requestType == 6 && isSyndicated) {
                            //Finally Complete the Workflow Task for System Extension after successfull plant direct Syndication
                            // that.onGetClaimTask();


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
                else {
                    if (requestType == 6) {
                        //Finally Complete the Workflow Task for System Extension
                        // that.onGetClaimTask();


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
                that.closeBusyDialog();
            },

            // Workflow Functions
            onOpenCommentsPopScreen: function (actionID, isWorkflowComment = true) {
                var oView = this.getView(),
                    oAppModel = this.getOwnerComponent().getModel("oAppModel"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    actionRefData = [],
                    mappedObj = null,
                    actioni18nText = null,
                    enableCommentOkBtn = true,
                    postToRepository = false,
                    commentsReq = null,
                    UserComments = {};
                if (isWorkflowComment) {
                    actionRefData = LookupModel.getProperty("/WorkflowDetails/taskActionMapping");
                    oAppModel.setProperty("/taskDetails/wfAction", actionID);
                }
                else {
                    actionRefData = LookupModel.getProperty("/RequestManagement/MaterialActionsMapping");
                }

                try {
                    mappedObj = actionRefData.find(obj =>
                        obj.actionID == actionID
                    );
                    actioni18nText = mappedObj?.actionText;
                    commentsReq = mappedObj?.commentsRequired;
                    postToRepository = mappedObj?.postToRepository || false;
                } catch (e) { }
                if (commentsReq) {
                    enableCommentOkBtn = false;
                }

                UserComments = {
                    actioni18nText: actioni18nText,
                    comment: null,
                    isWorkflowComment: isWorkflowComment,
                    enable_SubmitCommentBtn: enableCommentOkBtn,
                    commentsRequired: commentsReq,
                    actionID: actionID,
                    postToRepository: postToRepository
                }
                oAppModel.setProperty("/GeneralData/UserComments", UserComments);
                this.LoadFragment("ApproveReject_Comments", oView, true);
            },

            onCloseCommentsPopUp: function (oEvent) {
                this.byId("id_ApproveReject_Comments").close();
                //If Comments pop up closed, without entering the commets at the time of Exclusion
                if (oEvent) {
                    let oAppModel = this.getModelDetails("oAppModel"),
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        UserComments = oAppModel.getProperty("/GeneralData/UserComments"),
                        actionID = UserComments?.actionID,
                        selectedPath;
                    if (actionID === "exclude_system") {
                        selectedPath = MaterialDetails.getProperty("/GeneralData/bindingPathForExcludedSystem");
                        MaterialDetails.setProperty(selectedPath + '/isIncluded', true);
                    }
                    else if (actionID === "exclude_plant") {
                        selectedPath = MaterialDetails.getProperty("/GeneralData/bindingPathForExcludedPlant");
                        MaterialDetails.setProperty(selectedPath + '/isIncluded', true);
                    } else if (actionID === "exclude_document") {
                        selectedPath = MaterialDetails.getProperty("/GeneralData/bindingPathForExcludedDocument");
                        MaterialDetails.setProperty(selectedPath + '/isIncluded', true);
                    }
                    else if (actionID === "include_plant") {
                        selectedPath = MaterialDetails.getProperty("/GeneralData/bindingPathForExcludedDocument");
                        MaterialDetails.setProperty(selectedPath + '/isIncluded', false);
                    }
                    this.closeBusyDialog();
                }
            },

            onSubmitApproveRejectComments: async function (oEvent) {
                let oAppModel = this.getModelDetails("oAppModel"),
                    UserComments = oAppModel.getProperty("/GeneralData/UserComments"),
                    isWorkflowComment = UserComments?.isWorkflowComment,
                    actionID = UserComments?.actionID,
                    comment = UserComments?.comment,
                    requestNumber,
                    materialType = null,
                    materialListId = null,
                    commentFor = null,
                    that = this;
                this.onCloseCommentsPopUp();
                if (isWorkflowComment) {
                    let workflowDefinitionId = oAppModel.getProperty("/taskDetails/workflowDefinitionId"),
                        bShowMsg = false,
                        wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                        requestType = this.fnGetRequestHeaderData("requestType");
                    if (workflowDefinitionId === "materialmasterworkflow") {
                        requestNumber = this.onGetRequestNo();
                        materialListId = this.fnGetMaterialDetailsSelectedData("materialListId");
                        commentFor = "CreateProject";
                    }
                    else if (workflowDefinitionId === "materialmassuploadworkflow") {
                        var CreateMassRequest = this.getModelDetails("CreateMassRequest");
                        requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber");
                        commentFor = "CreateMassRequest"
                    }
                    this.fnPostComments(requestNumber, null, null, commentFor, comment, true);
                    //If Task is the Final Approver
                    if (actionID == 3) {
                        // For Change and Modify, if it's last task for approval, then call for Syndication service
                        if (requestType == 3 || requestType == 2) {
                            if (wfTaskType == "GQMD_WF_Task") {
                                this.onPressEsignbtn();
                            }
                            else {
                                let isSyncValidated = await this.fnToSyndicate(null, true, null, false, false);
                                if (isSyncValidated) {
                                    let isSyncSuccess = await this.fnToSyndicate(null, false, null, false, false);
                                    if (isSyncSuccess) {
                                        // await this.fnPostDocumentToContentServer();
                                        //TODO
                                        if (requestType == 3 || requestType == 2) {
                                            let documentSyndicationConfirmationMsg = this.resourceBundle.getText("documentSyndicationConfirmationMsg"),
                                                actions = ["YES", "NO"];
                                            let documentSyndication = this.fnCheckDocumentToSyndicate();
                                            if (documentSyndication) {
                                                this.showMessage(documentSyndicationConfirmationMsg, "Q", actions, "YES", function (action) {
                                                    if (action === "YES") {
                                                        // debugger;
                                                        that.onPressSyndicateDocument();
                                                    } else {
                                                        this.onGetClaimTask();
                                                    }
                                                });
                                            } else {
                                                this.onGetClaimTask();
                                            }

                                        } else {
                                            this.onGetClaimTask();
                                        }
                                    }
                                }
                            }
                        }
                        else if (requestType == 6) {
                            if (wfTaskType == "GQMD_WF_Task") {
                                this.onPressEsignbtn();
                            }
                            else {
                                this.onSyndicateBtn();
                            }
                        }
                        else {  // Create Request Type - directly complete the Task
                            this.onGetClaimTask();
                        }
                    }
                    else {
                        this.onGetClaimTask();
                    }
                }
                else {
                    // For Commit to Repo, Syndication and exclude material
                    commentFor = "CreateProject";
                    requestNumber = this.onGetRequestNo();
                    materialListId = this.fnGetMaterialDetailsSelectedData("materialListId");
                    await this.fnPostComments(requestNumber, null, materialListId, commentFor, comment, false);
                    if (actionID === "commit_To_Repo") {
                        this.fnToCommitToRepo();
                    }
                    else if (actionID === "syndicate_Material") {
                        this.fnStepsToSyndicate();
                    }
                    else if (actionID === "exclude_material") {
                        this.fnToExcludeMaterialAfterCommentSubmission(this); //TODO
                    }
                    else if (actionID === "exclude_system") {
                        this.fnToExcludeSystemData();
                    }
                    else if (actionID === "exclude_plant" || actionID == "include_plant") {
                        this.fnToExcludeorIncludePlantData();
                    }
                    else if (actionID === "exclude_document") {
                        this.fnToExcludeDoc();
                    }
                }
            },

            ToCheckforSubmitButtonEnabledinComments: function (oEvent) {
                var value = oEvent.getSource().getValue(),
                    oAppModel = this.getModelDetails("oAppModel"),
                    UserComments = oAppModel.getProperty("/GeneralData/UserComments"),
                    commentsReq = UserComments?.commentsRequired,
                    isEdit = true;
                if (commentsReq && (value === "" || value === undefined || value === null)) {
                    isEdit = false;
                }
                oAppModel.setProperty("/GeneralData/UserComments/enable_SubmitCommentBtn", isEdit);
            },

            fnToSyndicate: function (parentReqDetailsRepo, toValidate, repoRequestDetails = null, bShowMsg = true, directPlantSync = false, plantCodesForDirectSyndication = []) {
                return new Promise((resolve) => {
                    let CreateProject = this.getModelDetails("CreateProject"),
                        Repository = this.getModelDetails("Repository"),
                        viewName = this.getViewName(),
                        LookupModel = this.getModelDetails("LookupModel"),
                        allmaterialType = LookupModel.getProperty("/materialType"),
                        allRequestType = LookupModel.getProperty("/requestType"),
                        wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                        workflowRequestor = null,
                        materialTypeDesc = null,
                        requestTypeDesc = null,
                        syndicationPayload = {},
                        baseUomDtoList = this.fnToGetBaseUomListKeyCodePair(),
                        systemMaterialTypeIdDtoList = this.fnToGetMaterialTypeKeyCodePair(),
                        systemIdRefDtoList = this.fnToGetSystemKeyCodePair(),
                        url, requestType, requestNumber, matListData, materialTypeId, materialListId, materialNumber,
                        syndicationFor = "system",
                        that = this,
                        directSyndication = false,
                        currentDate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                        currentUser = this.fnGetCurrentUserMailID();
                    if (viewName === "CreateProject") {
                        requestType = this.fnGetRequestHeaderData("requestType");
                        requestNumber = this.fnGetRequestHeaderData("requestNumber");
                        matListData = CreateProject.getProperty("/MaterialList/selectedMaterialData");
                        materialTypeId = matListData?.materialTypeId;
                        materialListId = matListData?.materialListId;
                        materialNumber = matListData?.materialNumber;
                    }
                    else if (viewName === "Repository") {
                        requestType = repoRequestDetails?.requestTypeId;
                        requestNumber = repoRequestDetails?.requestNumber;
                        materialTypeId = Repository.getProperty("/MaterialSelected/materialTypeId");
                        materialListId = repoRequestDetails?.materialListId;
                        materialNumber = Repository.getProperty("/MaterialSelected/materialNumber");
                        directSyndication = true;
                    }
                    that.openBusyDialog();
                    try {
                        let mappedMaterialObj = allmaterialType.find(obj =>
                            obj.MM_KEY == materialTypeId
                        );
                        materialTypeDesc = mappedMaterialObj.MM_MATERIAL_TYPE_SAP_CODE;

                    } catch {
                    }
                    // if (wfTaskType === "Request_Form_Submission") {
                    workflowRequestor = this.fnGetCurrentUserMailID();
                    // }
                    if (directPlantSync && viewName === "Repository") {
                        requestNumber = parentReqDetailsRepo?.parentRequestNo;
                        materialListId = parentReqDetailsRepo?.parentMaterialistId;
                        requestType = "2";
                    }
                    try {
                        let mappedRequestObj = allRequestType.find(obj =>
                            obj.MM_KEY == requestType
                        );
                        requestTypeDesc = mappedRequestObj.MM_REQUEST_TYPE_DESCRIPTION;
                    }
                    catch { }
                    syndicationPayload = {
                        "systemIdRefDtoList": systemIdRefDtoList,
                        "baseUomDtoList": baseUomDtoList,
                        "systemMaterialTypeIdDtoList": systemMaterialTypeIdDtoList,
                        "materialDescription": null,
                        "materialListId": materialListId,
                        "materialNumber": materialNumber,
                        "materialTypeDesc": materialTypeDesc,
                        "materialTypeId": materialTypeId,
                        "requestNumber": requestNumber,
                        "requestTypeDesc": requestTypeDesc,
                        "requestTypeId": requestType,
                        "requestor": workflowRequestor,
                        "syndicateInBlockedStatus": true,
                        "validationMode": toValidate,
                        "directSyndication": directSyndication,
                        "wfTaskType": wfTaskType,
                        "createdOn": null, //to be sent null, discussed with backend
                        "createdBy": null,
                        "changedOn": currentDate,
                        "changedBy": currentUser
                    }
                    if (directPlantSync) {
                        syndicationFor = 'plant';
                        url = "MM_JAVA/syndicateSystemPlantExtension";
                        syndicationPayload.systemPlantList = plantCodesForDirectSyndication;
                    }
                    else {
                        // Create or System Extension Request Type - requires a new material to be created
                        if (requestType == 1 || requestType == 6) {
                            url = "MM_JAVA/syndicateCreateMaterial";
                        }
                        else if (requestType == 2) {
                            syndicationFor = 'plant';
                            url = "MM_JAVA/syndicateExtendMaterial";
                        }
                        else if (requestType == 3) {
                            url = "MM_JAVA/syndicateModifyMaterial";
                        }
                    }
                    this.fnProcessDataRequest(url, "POST", null, true, syndicationPayload,
                        function (responseData) {
                            let displayMsg,
                                oView = that.getView(),
                                actions = ["OK"];
                            if (responseData?.statusCode == 201 || responseData?.statusCode == 501) {
                                if (syndicationFor == 'system') {
                                    if (responseData?.isClassificationErrorPresent == true) {
                                        var classificationError = responseData?.classificationErrorDto,
                                            errorResponse = [];
                                        errorResponse.push({
                                            "systemId": classificationError?.systemId,
                                            "message": classificationError?.message
                                        })
                                    } else {
                                        var cpiErrorResponse = responseData?.cpiResponse?.errordetail || [],
                                            errorResponse = [];
                                        for (let error of cpiErrorResponse) {
                                            let systemID = error?.systemId,
                                                errorMsg = error?.message;
                                            for (let msg of errorMsg) {
                                                let erroFormatData = {
                                                    "systemId": systemID,
                                                    "message": msg?.message
                                                };
                                                errorResponse.push(erroFormatData);
                                            }
                                        }
                                    }
                                }
                                else {
                                    var plantErrorResponse = responseData?.responseMessage?.errordetail || [],
                                        errorResponse = [];
                                    for (let error of plantErrorResponse) {
                                        let plantID = error?.plantId,
                                            errorMsg = error?.message;
                                        for (let msg of errorMsg) {
                                            let erroFormatData = {
                                                "plantID": plantID,
                                                "message": msg?.message
                                            };
                                            errorResponse.push(erroFormatData);
                                        }
                                    }

                                }
                                CreateProject.setProperty("/GeneralData/SAPerror", {
                                    "errorFor": syndicationFor,
                                    "errorList": errorResponse
                                });
                                if (errorResponse?.length > 0) {
                                    that.LoadFragment("SyndicationError", oView, true);
                                    resolve(false);
                                }
                                else {
                                    if (bShowMsg) {
                                        displayMsg = toValidate ? that.geti18nText("successMDValidation") : that.geti18nText("successSyndication");
                                        that.showMessage(displayMsg, "S", actions, "OK", function (action) {
                                        });
                                    }
                                    if (viewName === "CreateProject") {
                                        toValidate ? null : that.ongetAllMaterialList(requestNumber);
                                    }
                                    if (viewName === "Repository" && !toValidate && !directPlantSync) {
                                        let successMessage = that.geti18nText("syndicationSuccessMsg") + requestNumber,
                                            syndicateParallelRequestResponses = Repository.getProperty("/syndicateParallelRequestResponses") || [];
                                        syndicateParallelRequestResponses.push({ msg: successMessage, successStatus: true });
                                        Repository.setProperty("/syndicateParallelRequestResponses", syndicateParallelRequestResponses);
                                    }
                                    if (viewName === "Repository" && !toValidate && directPlantSync) {
                                        let successMessage = that.geti18nText("plantDirectSyndicationMsg") + plantCodesForDirectSyndication?.map(item => item.split(":")[0]),
                                            syndicateParallelRequestResponses = Repository.getProperty("/syndicateParallelRequestResponses") || [];
                                        syndicateParallelRequestResponses.push({ msg: successMessage, successStatus: true });
                                        Repository.setProperty("/syndicateParallelRequestResponses", syndicateParallelRequestResponses);
                                    }
                                    resolve(true);
                                }
                                that.closeBusyDialog();
                            }
                            else {
                                displayMsg = toValidate ? that.geti18nText("ErrorSyncValidation") : that.geti18nText("ErrorSyndication");
                                that.showMessage(displayMsg, "E", actions, "OK", function (action) {
                                });
                                that.closeBusyDialog();
                                resolve(false);
                            }
                        },
                        function (errorResp) {
                            let displayMsg,
                                actions = ["OK"];
                            displayMsg = toValidate ? that.geti18nText("ErrorValidation") : that.geti18nText("ErrorSyndication");
                            that.showMessage(displayMsg, "E", actions, "OK", function (action) {
                            });
                            that.closeBusyDialog();
                            resolve(false);
                        }, true
                    );
                });
            },

            onGetWFContext: function (taskId) {
                var that = this,
                    CreateProjectModel = this.getModelDetails("CreateProject");
                if (!this.sResolvedURI) {
                    this.onGetResolvedURI();
                }
                return new Promise((resolve) => {
                    var sUrl = "MM_WORKFLOW/rest/v1/task-instances/" + taskId + "/context";
                    var oHeader = {};
                    that.fnProcessDataRequest(sUrl, "GET", oHeader, true, null,
                        function (data) {
                            let workflowRequestor = data?.workflowTaskDetails?.requestor;
                            CreateProjectModel.setProperty("/WorkflowDetails/workflowRequestor", workflowRequestor);
                            that.closeBusyDialog();
                            resolve(data);
                        },
                        function (error) {
                            resolve(null);
                            that.closeBusyDialog();
                        });
                });
            },

            onGetClaimTask: function () {
                var that = this,
                    oAppModel = oAppModel = this.getModelDetails("oAppModel"),
                    taskId = oAppModel.getProperty("/taskDetails/taskId"),
                    wfAction = oAppModel.getProperty("/taskDetails/wfAction"),
                    url = "MM_WORKFLOW/odata/v1/tcm/Claim?SAP__Origin='NA'&InstanceID='" + taskId + "'",
                    oHeader = {
                        "Accept": "application/json, text/javascript, */*; q=0.01",
                        "Content-Type": "application/json"
                    };
                that.fnProcessDataRequest(url, "POST", oHeader, true, null,
                    function (response) {
                        that.closeBusyDialog();
                        that.onCompleteTask(taskId, wfAction)
                    },
                    function (errorResp) {
                        that.closeBusyDialog();
                        var msg = "Task is not completed",
                            actions = ["OK"];
                        that.showMessage(msg, "E", actions, "OK", function (action) {
                        });
                    });
            },

            onCompleteTask: function (taskId, wfAction) {
                var payload,
                    url = "MM_WORKFLOW/rest/v1/task-instances/" + taskId,
                    LookupModel = this.getModelDetails("LookupModel"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    userMailID = oAppModel.getProperty("/userdetails/userMailID"),
                    allActionList = LookupModel.getProperty("/WorkflowDetails/taskActionMapping"),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    viewSource = this.getViewName(),
                    requestType = viewSource === "CreateProject" ? this.fnGetRequestHeaderData("requestType") : CreateMassRequest.getProperty("/RequestHeader/data/requestType"),
                    wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                    that = this, action = 1, completeWorkflow = false, massRequestReUpload = CreateMassRequest?.getProperty("/MassUpload/massRequestReUpload");
                try {
                    let mappedObj = allActionList.find(obj =>
                        obj.actionID == wfAction
                    );
                    action = mappedObj.wfActionIDMapping;
                    completeWorkflow = mappedObj.completeWorkflow;
                } catch {
                    return null;
                }
                this.onGetWFContext(taskId).then(function (context) {
                    context.workflowConditionsDetail.action = action;
                    context.workflowConditionsDetail.completeWorkflow = completeWorkflow;
                    context.workflowTaskDetails.lastApprover = userMailID;
                    if (viewSource == "CreateMassRequest") {
                        context.workflowConditionsDetail.massRequestReUpload = massRequestReUpload || false;
                    }
                    if (requestType == 3) { // For Change Request type
                        if (wfTaskType == "GMDM_WF_Task" || wfTaskType == "Requester_Rework_WF_Task") {
                            let CreateProject = that.getModelDetails("CreateProject"),
                                taskApproverRecalculation = CreateProject.getProperty("/GeneralData/wfApproverChainRecalculateForModify");
                            if (taskApproverRecalculation?.isToUpdatedContext) {
                                let newContextData = taskApproverRecalculation?.resetContextData;
                                //Last Approver Task Name
                                context.workflowTaskDetails.lastApproverTaskName = newContextData?.workflowTaskDetails?.lastApproverTaskName;
                                // GQMD Task Approver Group Name and Approver's List
                                context.workflowTaskDetails.gqmdApprover_Group = newContextData?.workflowTaskDetails?.gqmdApprover_Group;
                                context.workflowTaskDetails.gqmdApprover_RecipientUsers = newContextData?.workflowTaskDetails?.gqmdApprover_RecipientUsers;
                                if (wfTaskType == "Requester_Rework_WF_Task") {
                                    // Flexi Task Approver List
                                    context.workflowTaskDetails.flexiWorkflowTaskDetails = newContextData?.workflowTaskDetails?.flexiWorkflowTaskDetails;
                                    // GMDM Task Approver Group Name and Approver's List
                                    context.workflowTaskDetails.gmdmApprover_Group = newContextData?.workflowTaskDetails?.gmdmApprover_Group;
                                    context.workflowTaskDetails.gmdmApprover_RecipientUsers = newContextData?.workflowTaskDetails?.gmdmApprover_RecipientUsers;
                                }
                            }
                        }
                    }
                    payload = {
                        status: "COMPLETED",
                        context: context,
                    };
                    var oHeader = {};
                    that.fnProcessDataRequest(url, "PATCH", oHeader, true, payload,
                        function (data) {
                            var msg,
                                actions = ["OK"];
                            that.closeBusyDialog();
                            switch (action) {
                                case 1:
                                    msg = that.geti18nText("taskApprovalSuccess");
                                    break;
                                case 2:
                                    msg = that.geti18nText("taskRejectionSuccess");
                                    break;
                                case 3:
                                    msg = that.geti18nText("taskReturnSuccess");
                                    break;
                                case 4:
                                    msg = that.geti18nText("taskReturnToGMDMSuccess");
                                    break;
                                case 5:
                                    msg = that.geti18nText("taskCancelSuccess");
                                    break;
                            }
                            that.showMessage(msg, "S", actions, "OK", function (action) {
                                if (action === "OK") {
                                    window.top.close();
                                }
                            });
                        },
                        function (error) {
                            var msg,
                                actions = ["OK"];
                            that.closeBusyDialog();
                            switch (action) {
                                case 1:
                                    msg = that.geti18nText("taskApprovalError");
                                    break;
                                case 2:
                                    msg = that.geti18nText("taskRejectionError");
                                    break;
                                case 3:
                                    msg = that.geti18nText("taskReturnError");
                                    break;
                                case 4:
                                    msg = that.geti18nText("taskReturnToGMDMError");
                                    break;
                                case 5:
                                    msg = that.geti18nText("taskCancelError");
                                    break;
                            }
                            that.showMessage(msg, "E", actions, "OK", function (action) {
                                if (action === "OK") {
                                    window.top.close();
                                }
                            });
                        }
                    );
                })
            },

            fnSetWFDetailsTabVisibility: function () {
                //To handle Visibility of Workflow Details: 
                let CreateProject = this.getModelDetails("CreateProject"),
                    childRequestDetails = CreateProject.getProperty("/RequestHeader/childRequestDetails/data"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    requestStatus = this.fnGetRequestHeaderData("requestStatus"),
                    workflowInstanceId = this.fnGetRequestHeaderData("workflowInstanceId"),
                    workflowTabVisibility = {
                        "showWorkflowDetailsTab": false,
                        "showWorkflowDetails": false,
                        "showChildRequestMessage": false,
                        "showNoWorkflowTasksMessage": false
                    };
                switch (requestType) {
                    //Create Scenario
                    case 1:
                    case "1":
                        if (requestStatus != 1) {
                            workflowTabVisibility.showWorkflowDetailsTab = true;
                            if (workflowInstanceId) {
                                workflowTabVisibility.showWorkflowDetails = true;
                            }
                        }
                        break;
                    //Extend Scenario
                    case 2:
                    case "2":
                    //Extend Scenario - for New System
                    case 6:
                    case "6":
                    // Modify Scenario
                    case 3:
                    case "3":
                        if (requestStatus != 1) {
                            workflowTabVisibility.showWorkflowDetailsTab = true;
                            if (workflowInstanceId) {
                                workflowTabVisibility.showWorkflowDetails = true;
                            }
                            else if (childRequestDetails && childRequestDetails?.length > 0) {
                                workflowTabVisibility.showChildRequestMessage = true;
                            }
                        }
                        break;
                }
                CreateProject.setProperty("/WorkflowDetails/visibility", workflowTabVisibility);
            },

            getWorkflowDetails: function (requestNumber, modelName, workflowDefinitionId) {
                var that = this,
                    workflowDetailsUrl,
                    workflowInstanceId,
                    workflowDataModel = this.getModelDetails(modelName),
                    instanceIdurl = "MM_WORKFLOW/rest/v1/workflow-instances?businessKey=" + requestNumber + "&definitionId=" + workflowDefinitionId + "&%24inlinecount=none&%24orderby=startedAt%20desc";
                if (modelName == "CreateProject") {
                    this.fnSetWFDetailsTabVisibility();
                }
                this.fnProcessDataRequest(instanceIdurl, "GET", null, true, null,
                    async function (response) {
                        if (response.length != 0) {
                            workflowInstanceId = response[0].id;
                            workflowDetailsUrl = "MM_WORKFLOW/rest/v1/task-instances?workflowInstanceId=" + workflowInstanceId + "&$orderby=createdAt%20desc&$expand=attributes";
                            response[0].subject = "Material Master Workflow"
                            workflowDataModel.setProperty("/WorkflowDetails/processDetails", response[0]);
                            that.fnProcessDataRequest(workflowDetailsUrl, "GET", null, false, null,
                                function (data) {
                                    workflowDataModel.setProperty("/WorkflowDetails/taskDetails", data)
                                    for (var i = 0; i < data.length; i++) {
                                        if (data[i].processor != null) {
                                            workflowDataModel.setProperty("/WorkflowDetails/taskDetails/" + i + "/processor", data[i].processor);
                                        }
                                        else if (data[i].recipientUsers != [] || data[i].recipientGroups != []) {
                                            var users = data[i].recipientUsers.concat(data[i].recipientGroups);
                                            workflowDataModel.setProperty("/WorkflowDetails/taskDetails/" + i + "/processor", users);
                                        }
                                        else {
                                            workflowDataModel.setProperty("/WorkflowDetails/taskDetails/" + i + "/processor", "");
                                        };
                                    };
                                    that.closeBusyDialog();
                                },
                                function (errorResp) {
                                    that.closeBusyDialog();
                                });
                        }
                        else {
                            if (modelName == "CreateProject") {
                                let CreateProject = that.getModelDetails("CreateProject");
                                CreateProject.setProperty("/WorkflowDetails/visibility/showNoWorkflowTasksMessage", true);
                            }
                            that.closeBusyDialog();
                        }
                    },
                    function (errorResp) {
                        that.closeBusyDialog();
                    });
            },

            //Organizational Data
            onClickAddNewPlant: function () {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    newPlantData = {
                        "isIncluded": true,
                        "salesOrg": "",
                        "wareHouse": "",
                        "costing": "",
                        "isSapSyndicated": false,
                        "batchManagement": true,
                        "batchManagementBtnEnability": false,
                        "systemId": null,
                        "targetSystemBtnEditability": false,
                        "plantSpecificMatStatus": "",
                        "requestPlantStatus": 1  // By Default, set to Draft Status
                    };
                if (wfTaskType != "Request_Form_Submission") {
                    newPlantData.requestPlantStatus = 2;
                }
                MaterialDetails.setProperty("/OrganizationalData/newPlantData", newPlantData);
                MaterialDetails.setProperty("/OrganizationalData/listofPlantSpccificMatList", []);
                MaterialDetails.setProperty("/OrganizationalData/addPlantClicked", true);
                MaterialDetails.setProperty("/OrganizationalData/editPlantClicked", false);
                this.onLoadingPlantData(true);
                this.LoadFragment("AddNewPlants", oView, true);
            },

            onLoadingPlantSpecificMatStatusList: async function (systemID) {
                let LookupModel = this.getModelDetails("LookupModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    plantSpecifcMatList = LookupModel.getProperty(`/oDataLookups/${systemID}/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`);
                if (!plantSpecifcMatList) {
                    await this.fnToRenderOdataLookup(systemID);
                    plantSpecifcMatList = LookupModel.getProperty(`/oDataLookups/${systemID}/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`);
                }
                MaterialDetails.setProperty("/OrganizationalData/listofPlantSpccificMatList", JSON.parse(JSON.stringify(plantSpecifcMatList)));
            },

            onLoadingPlantData: function (toAddNewPlant) {
                var LookupModel = this.getModelDetails("LookupModel"),
                    listOfAllPlants = LookupModel.getProperty("/MM_PLANT_REF_LIST"),
                    that = this;
                if (!listOfAllPlants) {
                    let conditions = [
                        {
                            "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": "*"
                        }
                    ],
                        systemOrders = {
                            "MM_PLANT_REF_LIST.MM_PLANT_REF_LIST_DESC": "ASC"
                        }
                    // systemFilters = [
                    //     {
                    //         "column": "MM_PLANT_REF_LIST.MM_PLANT_ACTIVE",
                    //         "operator": "in",
                    //         "value": "('1', '3')"
                    //     }
                    // ];
                    let payload = that.onGetRulePayload("MM_PLANT_REF_LIST", conditions, systemOrders, systemFilters);
                    that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                        function (responseData) {
                            listOfAllPlants = responseData?.data?.result[0]?.MM_PLANT_REF_LIST;
                            LookupModel.setProperty("/MM_PLANT_REF_LIST", listOfAllPlants);
                            that.updatePlantRefList(toAddNewPlant);
                        },
                        function (error) { }
                    );
                }
                else {
                    this.updatePlantRefList(toAddNewPlant);
                }
            },

            updatePlantRefList: function (toAddNewPlant) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    selectedPlants = MaterialDetails.getProperty("/OrganizationalData/selectedPlants"),
                    selectedSystemsList = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    listOfAllPlants = LookupModel.getProperty("/MM_PLANT_REF_LIST"),
                    editPlant = MaterialDetails.getProperty("/OrganizationalData/editPlantClicked"),
                    id_MS_Excluded = 6,
                    id_MS_Not_Applicable = 13,
                    listofFilteredPlants = [];

                listofFilteredPlants = JSON.parse(JSON.stringify(listOfAllPlants));

                listofFilteredPlants = listofFilteredPlants.filter(plant => plant.MM_PLANT_ACTIVE != 2);

                if (selectedPlants) {

                    if (!editPlant) {
                        for (let plant of selectedPlants) {
                            let index = listofFilteredPlants.findIndex(eachPlant => eachPlant.MM_KEY == plant.MM_PLANT_ID);
                            if (index != -1) {
                                listofFilteredPlants.splice(index, 1);
                            }
                        }
                    }
                }
                if (!editPlant && selectedSystemsList && wfTaskType != "Request_Form_Submission") {
                    let systemIDNAList = selectedSystemsList.filter(function (eachSystem) {
                        return eachSystem.requestSystemStatusId == id_MS_Excluded || eachSystem.requestSystemStatusId == id_MS_Not_Applicable;
                    }).map(systemData => systemData.MM_SYSTEM_ID);
                    for (let systemID of systemIDNAList) {
                        listofFilteredPlants = listofFilteredPlants.filter(function (plant) {
                            return plant.MM_TARGET_SYSTEM_ID != systemID;
                        })
                    }
                }
                if (toAddNewPlant) {
                    let materialNumber = this.fnGetMaterialDetailsSelectedData("materialNumber") || null,
                        requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                        onGoingAttributeChangesPayload = {
                            "attributeId": null,
                            "materialNumber": materialNumber,
                            "readAttributeData": true,
                            "readPlantData": true,
                            "requestNumber": requestNumber,
                            "systemId": null,
                            "uiView": null
                        };
                    this.fnProcessDataRequest("MM_JAVA/getOnGoingAttributeChanges", "POST", null, false, onGoingAttributeChangesPayload, function (response) {
                        let onGoingPlantsList = response?.response;
                        listofFilteredPlants = listofFilteredPlants.filter(function (plant) {
                            return !onGoingPlantsList.some(toFilterPlants => toFilterPlants.plantCode == plant.MM_PLANT_REF_LIST_CODE)
                        })
                    }, function (errResponse) {
                    }, true);
                }
                MaterialDetails.setProperty("/OrganizationalData/listofFilteredPlants", listofFilteredPlants);
            },

            fnHandleInputProfitCenter: function (oEvent, profitCenterCode = null) {
                return new Promise((resolve) => {
                    let MaterialDetails = this.getModelDetails("MaterialDetails"),
                        lookupModel = this.getModelDetails("LookupModel"),
                        listOfAllPlants = lookupModel.getProperty("/MM_PLANT_REF_LIST"),
                        plantId = MaterialDetails.getProperty("/OrganizationalData/newPlantData/MM_PLANT_ID"),
                        companyCode = MaterialDetails.getProperty("/OrganizationalData/newPlantData/companyCode"),
                        system = MaterialDetails.getProperty("/OrganizationalData/newPlantData/systemId"),
                        profitCenter = oEvent?.getSource()?.getValue() || profitCenterCode,
                        dropdownModelName = lookupModel.getProperty(`/oDataTargetSystemIdToModel/${system}`),
                        dropdownModel = this.getModelDetails(dropdownModelName),
                        url = "/ProfitCentresSet", aFilters, plant;

                    dropdownModel?.setUseBatch(false);

                    listOfAllPlants.map(item => {
                        if (item.MM_KEY == plantId) {
                            plant = item.MM_PLANT_REF_LIST_CODE;
                        }
                    });

                    aFilters = [
                        new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant),
                        new sap.ui.model.Filter("ProfitCentreName", sap.ui.model.FilterOperator.EQ, profitCenter)
                    ];

                    if (this.debouncedSearchTimer) {
                        clearTimeout(this.debouncedSearchTimer);
                    }

                    this.debouncedSearchTimer = setTimeout(() => {
                        if (profitCenter?.length > 2) {
                            dropdownModel?.read(url, {
                                filters: aFilters,
                                urlParameters: {
                                    "$format": "json",
                                    "$top": 100
                                },
                                success: function (oData) {
                                    MaterialDetails.setProperty("/OrganizationalData/ProfitCenterSuggestedLookup", oData.results);
                                    resolve();
                                },
                                error: function () {
                                    MaterialDetails.setProperty("/OrganizationalData/ProfitCenterSuggestedLookup", []);
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }
                    }, 500);
                });
            },

            onSuggestProfitCenter: function (oEvent) {
                const oInput = oEvent.getSource();

                // Attach custom filter only once
                if (!oInput._bFilterFunctionSet) {
                    oInput.setFilterFunction(function (sTerm, oItem) {
                        return oItem.getText().toLowerCase().includes(sTerm.toLowerCase()) ||
                            (oItem.getAdditionalText() && oItem.getAdditionalText().toLowerCase().includes(sTerm.toLowerCase()));
                    });
                    oInput._bFilterFunctionSet = true; // mark so it doesn’t reapply every time
                }
            },
            
            debouncedButtonTimer: function (func, key, delay = 4000) {
                if (this._debounceTimers[key]) {
                    return;
                }
                func.call(this);
                this._debounceTimers[key] = setTimeout(() => {
                    delete this._debounceTimers[key];
                }, delay);
            },
 

            validateProfitCenter: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    profitCenterVal = MaterialDetails.getProperty("/OrganizationalData/newPlantData/profitCenterId"),
                    profitCenterLookUpValues = MaterialDetails.getProperty("/OrganizationalData/ProfitCenterSuggestedLookup"),
                    matchFound = false;

                if (profitCenterLookUpValues && profitCenterLookUpValues?.length != 0) {
                    matchFound = profitCenterLookUpValues.some(function (item) {
                        return item.ProfitCtnr == profitCenterVal;
                    });
                }

                if (!matchFound) {
                    return false;
                }
                return true;
            },

            fnSuggestedProfitCenterSelected: async function (oEvent) {
                let selectedItem = oEvent.getParameter("selectedItem");
                if (selectedItem) {
                    let selectedKey = selectedItem.getKey();
                    this.getModelDetails("MaterialDetails")
                        .setProperty("/OrganizationalData/newPlantData/profitCenterId", selectedKey);

                    await this.fnHandleInputProfitCenter(null, selectedKey);
                }
            },

            fnAddNewPlantValidationCheck: async function (inputArr) {
                let isValid = true,
                    viewName = this.getViewName(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    wfTaskType = this.fnGetWfDetailsModelData("wfTaskType");

                for (let item of inputArr) {
                    if (!item?.value) {
                        if ((item.text === "Profit_Center" && (viewName === "Repository" || wfTaskType === "GMDM_WF_Task")) || item.text === "Plant") {
                            isValid = false;
                            MaterialDetails.setProperty(item?.path, "Error");
                        }
                    }

                    if (item.text === "Profit_Center" && item.value) {
                        await this.fnHandleInputProfitCenter(null, item.value); // wait for OData call to finish
                        if (!this.validateProfitCenter()) {
                            isValid = false;
                            MaterialDetails.setProperty(item?.path, "Error");
                        }
                    }

                    if (isValid) MaterialDetails.setProperty(item?.path, "None");
                }

                return isValid;
            },


            onSelectNewPlantID: function (oEvent) {
                let sPath = oEvent?.getParameter("selectedItem")?.getBindingContext("MaterialDetails")?.sPath,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    profitCenterCode = (MaterialDetails.getProperty(sPath))?.MM_PROFIT_CENTER_REF_LIST_CODE,
                    systemId = (MaterialDetails.getProperty(sPath))?.MM_TARGET_SYSTEM_ID,
                    companyCode = (MaterialDetails.getProperty(sPath))?.MM_COMPANY_REF_CODE,
                    plantActive = (MaterialDetails.getProperty(sPath))?.MM_PLANT_ACTIVE;
                this.onLoadingPlantSpecificMatStatusList(systemId);
                if (systemId == 1) { // For GEP System, the default value is "Z0"
                    MaterialDetails.setProperty("/OrganizationalData/newPlantData/plantSpecificMatStatus", "Z0");
                }
                else if (systemId == 2) { // For RP1 System, the default value is "Z1"
                    MaterialDetails.setProperty("/OrganizationalData/newPlantData/plantSpecificMatStatus", "Z1");
                }
                MaterialDetails.setProperty("/OrganizationalData/newPlantData/profitCenterId", profitCenterCode);
                MaterialDetails.setProperty("/OrganizationalData/newPlantData/companyCode", companyCode);
                MaterialDetails.setProperty("/OrganizationalData/newPlantData/systemId", systemId);
                MaterialDetails.setProperty("/OrganizationalData/newPlantData/plantActive", plantActive);
            },

            fnAddNewPlantData: function() {
                this.debouncedButtonTimer(
                    this._executeAddNewPlantData,
                    "addPlantButton",  // Unique key for this button
                    3000  // Delay in milliseconds (adjust as needed)
                );
            },
            _executeAddNewPlantData: async function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    newPlantData = MaterialDetails.getProperty("/OrganizationalData/newPlantData"),
                    selectedPlants = MaterialDetails.getProperty("/OrganizationalData/selectedPlants"),
                    systemData = MaterialDetails.getProperty("/SystemData/selectedSystems"), validationArr = [
                        {
                            "path": "/OrganizationalData/addNewPlant/valueState/profitCenter",
                            "value": newPlantData.profitCenterId,
                            "text": "Profit_Center"
                        },
                        {
                            "path": "/OrganizationalData/addNewPlant/valueState/plant",
                            "value": newPlantData.MM_PLANT_ID,
                            "text": "Plant"
                        }];
                if (!selectedPlants) {
                    selectedPlants = [];
                }
                // if (viewName == "Repository" || wfTaskType == "GMDM_WF_Task") {
                //     validationArr.push({
                //         "path": "/OrganizationalData/addNewPlant/valueState/profitCenter",
                //         "value": newPlantData.profitCenterId
                //     });
                // }
                let isValid = await this.fnAddNewPlantValidationCheck(validationArr);
                if (isValid) {
                    selectedPlants.push(newPlantData);
                    MaterialDetails.setProperty("/OrganizationalData/selectedPlants", selectedPlants);

                    //For the requirement that if a system data is not present for the corresponding system Id of the plant we are adding then we have to forcefully add a system data for the specific system Id
                    // Filter out invalid entries (where systemId is undefined or null)
                    // let validSystemData = systemData.filter(item => newPlantData.targetSystem !== undefined && newPlantData.targetSystem !== null);

                    let exists = systemData.some(item => item.MM_SYSTEM_ID == newPlantData.systemId);

                    if (!exists) {
                        let newSystemData = JSON.parse(JSON.stringify(MaterialDetails.getProperty("/SystemData/newSystemDataTemplate")));
                        newSystemData.MM_SYSTEM_ID = newPlantData.systemId;
                        MaterialDetails.setProperty("/SystemData/newSystemData", newSystemData);
                        this.fnAddNewSystemData();
                        //systemData.push(newSystemData);
                    }
                    //MaterialDetails.setProperty("/SystemData/selectedSystems", systemData);
                    this.onCancelAddPlant()
                }
            },

            fnUpdateExistingPlantData: async function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    updatedPlantData = MaterialDetails.getProperty("/OrganizationalData/newPlantData"),
                    oldPlantdata = MaterialDetails.getProperty("/OrganizationalData/selectedPlant"),
                    selectedPath = MaterialDetails.getProperty("/OrganizationalData/selectedPath"),
                    plantId = updatedPlantData.MM_PLANT_ID,
                    viewName = this.getViewName(),
                    profitCenterId = updatedPlantData.profitCenterId,
                    wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"), validationArr = [
                        {
                            "path": "/OrganizationalData/addNewPlant/valueState/profitCenter",  //Removed temporarily for allowing users to extend in QA
                            "value": updatedPlantData.profitCenterId,
                            "text": "Profit_Center"
                        },
                        {
                            "path": "/OrganizationalData/addNewPlant/valueState/plant",
                            "value": updatedPlantData.MM_PLANT_ID,
                            "text": "Plant"
                        }];
                let isValid = await this.fnAddNewPlantValidationCheck(validationArr);
                if (isValid) {
                    MaterialDetails.setProperty(selectedPath, updatedPlantData);
                    this.onCancelAddPlant();
                }
                // if (viewName == "Repository" || wfTaskType == "GMDM_WF_Task") {
                //     if (!plantId || !profitCenterId) {
                //         new sap.m.MessageToast.show("Plant and Profit Center are mandatory fields.");
                //     } else {
                //         this.onCancelAddPlant();
                //     }
                // }
                // else {
                //     if (!plantId) {
                //         new sap.m.MessageToast.show("Plant is the mandatory field.");
                //     } else {
                //         this.onCancelAddPlant();
                //     }
                // }
            },

            onCancelAddPlant: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails");
                MaterialDetails.setProperty("/OrganizationalData/addNewPlant/valueState", {});
                this.byId("id_AddNewPlants").close();
            },

            onDeletePlant: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    actions = ["NO", "YES"],
                    that = this,
                    confirmationMsg = this.resourceBundle.getText("deleteConfirmation"),
                    materialListId = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/materialListId"),
                    selectedPlants = MaterialDetails.getProperty("/OrganizationalData/selectedPlants"),
                    selectedPlantsSaved = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/organizationalDataDtos"),
                    selectedPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedIndex = parseInt(selectedPath.split('/').pop(10)),
                    plantId = selectedPlants[selectedIndex].MM_PLANT_ID,
                    plantCode = selectedPlants[selectedIndex]?.plantCode,
                    savedPlantIds = selectedPlantsSaved?.map((item) => item.MM_PLANT_ID);
                this.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                    if (action === "YES") {

                        if (!materialListId || !(savedPlantIds?.includes(plantId))) {
                            let selectedDataToDelete = MaterialDetails.getProperty(selectedPath),
                                filteredData = selectedPlants.filter(item => item.MM_PLANT_ID !== selectedDataToDelete.MM_PLANT_ID);
                            MaterialDetails.setProperty("/OrganizationalData/selectedPlants", filteredData);
                        }
                        else {
                            let CreateProject = that.getModelDetails("CreateProject"),
                                requestNumber = CreateProject.getProperty("/RequestHeader/data/requestNumber"),
                                url = `MM_JAVA/deletePlant`;
                            let deletePlantPayload =
                            {
                                "materialListId": materialListId,
                                "plantCode": plantCode,
                                "plantId": plantId,
                                "requestNumber": requestNumber
                            }
                            that.fnProcessDataRequest(url, "POST", null, true, deletePlantPayload,
                                async function (responseData) {
                                    if (responseData?.statusCode === "200") {
                                        let selectedDataToDelete = MaterialDetails.getProperty(selectedPath),
                                            filteredData = selectedPlants?.filter(item => item.MM_PLANT_ID !== selectedDataToDelete.MM_PLANT_ID);
                                        MaterialDetails.setProperty("/OrganizationalData/selectedPlants", filteredData);

                                        //Updating the old Payload to not have the deleted Plant
                                        let filteredDataSaved = selectedPlantsSaved?.filter(item => item.MM_PLANT_ID !== selectedDataToDelete.MM_PLANT_ID)
                                        MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/organizationalDataDtos", JSON.parse(JSON.stringify(filteredDataSaved)));
                                    }
                                    // await that.getDatabyMaterialListId(materialListId);
                                    that.onGetFilteredDataMatChangeLog(that.getViewName(), true);
                                    that.closeBusyDialog();
                                },
                                function (responseData) { })
                        }
                    }
                });
            },

            onClickEditPlant: function (oEvent) {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedPlantData = MaterialDetails.getProperty(selectedPath),
                    systemID = selectedPlantData?.systemId;
                MaterialDetails.setProperty("/OrganizationalData/addPlantClicked", false);
                MaterialDetails.setProperty("/OrganizationalData/editPlantClicked", true);
                this.onLoadingPlantData(false);
                this.onLoadingPlantSpecificMatStatusList(systemID);
                MaterialDetails.setProperty("/OrganizationalData/selectedPlant", selectedPlantData);
                MaterialDetails.setProperty("/OrganizationalData/newPlantData", JSON.parse(JSON.stringify(selectedPlantData)));

                MaterialDetails.setProperty("/OrganizationalData/newPlantData/batchManagement", true);
                MaterialDetails.setProperty("/OrganizationalData/newPlantData/batchManagementBtnEnability", false);
                MaterialDetails.setProperty("/OrganizationalData/newPlantData/targetSystemBtnEditability", false);

                MaterialDetails.setProperty("/OrganizationalData/selectedPath", selectedPath);
                this.LoadFragment("AddNewPlants", oView, true);
            },

            //systemId
            onClickAddSystemData: function () {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    newSystemData = JSON.parse(JSON.stringify(MaterialDetails.getProperty("/SystemData/newSystemDataTemplate"))),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType");
                newSystemData.scenario = "add"; // To indicate Add new System
                newSystemData.targetFieldsEditable = false; // Default to NON-EDITABLE
                if (wfTaskType !== "Request_Form_Submission") {
                    newSystemData.requestSystemStatusId = 2;
                }
                this.updateSystemList();
                MaterialDetails.setProperty("/SystemData/newSystemData", newSystemData);
                this.LoadFragment("AddNewSystems", oView, true);
            },

            fnAddNewSystemData: async function () {

                let that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    newSystemData = MaterialDetails.getProperty("/SystemData/newSystemData"),
                    reqHeaderMatType,
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    repository = this.getModelDetails("Repository"),
                    RequestManagement = this.getModelDetails("RequestManagement"),
                    materialNumber = repository.getProperty("/MaterialSelected/materialNumber");

                //this.openBusyDialog();

                if (RequestManagement.getProperty("/source") === "requestManagement") {
                    reqHeaderMatType = this.fnGetRequestHeaderData("materialType");
                } else if (oAppModel.getProperty("/sideNavigation/currentView") == "Repository") {
                    reqHeaderMatType = repository.getProperty("/MaterialSelected/materialTypeId");
                }


                if (newSystemData?.MM_SYSTEM_ID) {
                    newSystemData.reqSystemStatus = 1;
                    MaterialDetails.setProperty("/newSystemData/valueState/MM_SYSTEM_ID", "None");
                    if (!selectedSystems) {
                        selectedSystems = [];
                    }
                    selectedSystems.push(newSystemData);
                    MaterialDetails.setProperty("/SystemData/selectedSystems", selectedSystems);
                    if (that.gViewName === "Repository") {
                        await that.fnSetSystemProperties(null, materialNumber, that.gViewName);
                    }
                    this.openBusyDialog();
                    await this.fnToRenderOdataLookup(newSystemData?.MM_SYSTEM_ID);
                    await this.fnToRenderRulesLookup(reqHeaderMatType, newSystemData?.MM_SYSTEM_ID);
                    await this.fnToLoadSystemDetails(newSystemData?.MM_SYSTEM_ID); //This setsup the default values in the model as soon as we are adding a system...[Bug Fix]
                    this.fnUpdateAltUomDataMaterialAdd(newSystemData?.MM_SYSTEM_ID);
                    this.onCancelAddSystem();
                }
                else {
                    MaterialDetails.setProperty("/SystemData/newSystemData/valueState/MM_SYSTEM_ID", "Error");
                }
                this.closeBusyDialog();

            },

            onCancelAddSystem: function () {
                this.byId("id_AddNewSystems")?.close();
            },

            updateSystemList: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    listOfAllSystems = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    listofFilteredSystems = [];
                if (selectedSystems) {
                    listofFilteredSystems = JSON.parse(JSON.stringify(listOfAllSystems));
                    for (let system of selectedSystems) {
                        let index = listofFilteredSystems.findIndex(eachSystem => eachSystem.MM_KEY == system.MM_SYSTEM_ID);
                        if (index != -1) {
                            listofFilteredSystems.splice(index, 1);
                        }
                    }
                }
                MaterialDetails.setProperty("/SystemData/listofFilteredSystems", listofFilteredSystems);
            },

            onClickEditSystem: function (oEvent) {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedSystemData = MaterialDetails.getProperty(selectedPath),
                    newSystemData = JSON.parse(JSON.stringify(MaterialDetails.getProperty("/SystemData/newSystemDataTemplate")));
                newSystemData = { ...newSystemData, ...selectedSystemData }; // to copy the Value
                newSystemData.scenario = "edit"; // to Indicate, this system is modified for a Material
                // newSystemData.requestSystemStatusId = 1; // On Edit operation, update the Status to Draft
                let isRP1 = (newSystemData.MM_SYSTEM_ID === "RP1" || newSystemData.MM_SYSTEM_ID === "2" || newSystemData.MM_SYSTEM_ID === 2);
                newSystemData.targetFieldsEditable = isRP1; // True only for RP1  
                MaterialDetails.setProperty("/SystemData/newSystemData", newSystemData);
                MaterialDetails.setProperty("/SystemData/selectedPath", selectedPath);
                this.updateSystemList();
                this.LoadFragment("AddNewSystems", oView, true);
            },

            fnUpdateExistingSystemData: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    updatedSystemData = MaterialDetails.getProperty("/SystemData/newSystemData"),
                    selectedPath = MaterialDetails.getProperty("/SystemData/selectedPath");
                MaterialDetails.setProperty(selectedPath, updatedSystemData);
                this.onCancelAddSystem();
            },

            onDeleteSystem: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    actions = ["NO", "YES"],
                    that = this,
                    confirmationMsg = this.resourceBundle.getText("deleteConfirmation"),
                    materialListId = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/materialListId"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    selectedSystemsSaved = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/systemData"),
                    selectedPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedIndex = parseInt(selectedPath.split('/').pop(10)),
                    SystemId = selectedSystems[selectedIndex].MM_SYSTEM_ID,
                    savedSystemIds = selectedSystemsSaved?.map((item) => item.MM_SYSTEM_ID);


                this.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                    if (action === "YES") {

                        if (!materialListId || !(savedSystemIds?.includes(SystemId))) {
                            let selectedDataToDelete = MaterialDetails.getProperty(selectedPath),
                                filteredData = selectedSystems.filter(item => item.MM_SYSTEM_ID !== selectedDataToDelete.MM_SYSTEM_ID),
                                aggregatedSystemDetails = MaterialDetails.getProperty("/AggregatedSystemDetails"),
                                systemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${SystemId}`);
                            MaterialDetails.setProperty("/SystemData/selectedSystems", filteredData);
                            if (systemDetails && aggregatedSystemDetails) {
                                delete aggregatedSystemDetails[SystemId]
                            }
                        }
                        else {
                            let url = `MM_JAVA/deleteSystemData`,
                                deleteSystemPayload =
                                {
                                    "materialListId": materialListId,
                                    "systemId": SystemId
                                }
                            that.fnProcessDataRequest(url, "POST", null, true, deleteSystemPayload,
                                async function (responseData) {
                                    if (responseData?.statusCode === "200") {
                                        let selectedDataToDelete = MaterialDetails.getProperty(selectedPath),
                                            filteredData = selectedSystems?.filter(item => item.MM_SYSTEM_ID != selectedDataToDelete.MM_SYSTEM_ID),
                                            aggregatedSystemDetails = MaterialDetails.getProperty("/AggregatedSystemDetails"),
                                            systemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${SystemId}`);
                                        MaterialDetails.setProperty("/SystemData/selectedSystems", filteredData);

                                        //Updating the old Payload to not have the deleted System
                                        let filteredDataSaved = selectedSystemsSaved?.filter(item => item.MM_SYSTEM_ID != selectedDataToDelete.MM_SYSTEM_ID)
                                        MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/systemData", JSON.parse(JSON.stringify(filteredDataSaved)));
                                        if (systemDetails && aggregatedSystemDetails) {
                                            delete aggregatedSystemDetails[SystemId]
                                        }
                                    }
                                    // await that.getDatabyMaterialListId(materialListId);
                                    that.onGetFilteredDataMatChangeLog(that.getViewName(), true);
                                    that.closeBusyDialog();
                                },
                                function (responseData) { })
                        }
                    }
                });
            },

            //editable state based on current system
            onSelectNewSystemId: function(oEvent) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedItem = oEvent.getParameter("selectedItem"),
                    selectedKey = selectedItem ? selectedItem.getKey() : null;
            
                if (selectedKey) {
                    MaterialDetails.setProperty("/SystemData/newSystemData/MM_SYSTEM_ID", selectedKey);
                    
                    let isRP1 = (selectedKey === "RP1" || selectedKey === "2" || selectedKey === 2);
                    MaterialDetails.setProperty("/SystemData/newSystemData/targetFieldsEditable", isRP1);

                    if (!isRP1) {
                        MaterialDetails.setProperty("/SystemData/newSystemData/MM_TARGET_SYSTEM_MATERIAL_ID", "");
                        MaterialDetails.setProperty("/SystemData/newSystemData/MM_TARGET_SYSTEM_MATERIAL_TYPE_ID", "");
                    }
                    MaterialDetails.setProperty("/SystemData/newSystemData/valueState/MM_SYSTEM_ID", "None");
                    MaterialDetails.refresh(true);
                }
            },

            //Workflow Details Model Reference
            onUpdateWorkflowDetailsModel: function (modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    workflowDetailstData = modelDetails.getProperty("/WorkflowDetails"),
                    workflowDetailsModel = this.getView().getModel("workflowDetailsModel");
                if (!workflowDetailsModel) {
                    workflowDetailsModel = new JSONModel();
                    this.getView().setModel(workflowDetailsModel, "workflowDetailsModel");
                }
                workflowDetailstData.usedFor = modelDetails;
                workflowDetailsModel.setData(workflowDetailstData);
                workflowDetailsModel.refresh(true);
            },

            //Workflow srv
            fnStartWorkflow: function (context, viewSource) {
                var that = this,
                    successMsg,
                    oAppModel = this.getModelDetails("oAppModel"),
                    CurrentModel = this.getModelDetails(viewSource),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    requestType = viewSource === "CreateProject" ? this.fnGetRequestHeaderData("requestType") : CreateMassRequest.getProperty("/RequestHeader/data/requestType"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    startInstancePayload = {
                        definitionId: viewSource === "MassRequestPage" ? "materialmassuploadworkflow" : "materialmasterworkflow",
                        context: context
                    };
                startInstancePayload["context"]["workflowConditionsDetail"]["completeWorkflow"] = false;
                startInstancePayload["context"]["workflowConditionsDetail"]["sourceOfRequest"] = viewSource === "CreateProject" ? 1 : 2;
                startInstancePayload["context"]["workflowConditionsDetail"]["massRequestReUpload"] = false;


                if (viewSource === "Repository") {
                    requestType = 3;
                    startInstancePayload["context"]["workflowConditionsDetail"]["sourceOfRequest"] = 1;
                }

                this.fnProcessDataRequest("MM_WORKFLOW/rest/v1/workflow-instances", "POST", {}, true, startInstancePayload,
                    function (response) {
                        that.closeBusyDialog();
                        if ((requestType == 1 && wfTaskType == "Request_Form_Submission") || requestType == 4 || requestType == 5 || requestType == 7 || requestType == 8) {
                            successMsg = that.resourceBundle.getText("workflowTriggered");
                            that.showMessage(successMsg, "S", ["OK"], "OK", function (action) {
                                if (action === "OK") {
                                    if (viewSource === "RepositoryPage") {
                                        that.getView().byId("repositoryTableId").fireRowSelectionChange();
                                    } else if (viewSource === "CreateProject") {
                                        that.navigateTo("RequestManagement");
                                    } else {
                                        that.navigateTo("MassRequest");
                                    }
                                }
                            });
                        }
                        else {
                            let successMessage = that.geti18nText("wfSuccessMsg") + context.creationFromWorkflowRequest.requestNumber,
                                wfParallelRequestResponses = CurrentModel.getProperty("/wfParallelRequestResponses") || [];
                            wfParallelRequestResponses.push({ msg: successMessage, successStatus: true });
                            CurrentModel.setProperty("/wfParallelRequestResponses", wfParallelRequestResponses);
                        }
                    },
                    function (errorResp) {
                        if (requestType == 3 || requestType == 2 || requestType == 6 && (requestType == 1 && wfTaskType != "Request_Form_Submission")) {
                            let errorMessage = that.geti18nText("wfErrorMsg") + context.creationFromWorkflowRequest.requestNumber,
                                wfParallelRequestResponses = CurrentModel.getProperty("/wfParallelRequestResponses") || [];
                            wfParallelRequestResponses.push({ msg: errorMessage, successStatus: false });
                            CurrentModel.setProperty("/wfParallelRequestResponses", wfParallelRequestResponses);
                        }
                        that.closeBusyDialog();
                    }, true);
            },

            //Action Footer Functionality
            onDeleteDraftRequest: function () {
                let requestNo = this.onGetRequestNo(),
                    viewName = this.getViewName(),
                    url = "MM_JAVA//deleteAll/" + requestNo,
                    confirmMsg = this.resourceBundle.getText("areYouSureToDelete") + requestNo + "?",
                    currentView = viewName === "CreateProject" ? "RequestManagement" : "MassRequest",
                    that = this;
                this.showMessage(confirmMsg, "Q", ["NO", "YES"], "YES", function (action) {
                    if (action === "YES") {
                        that.fnProcessDataRequest(url, "DELETE", null, true, null,
                            function () {
                                that.closeBusyDialog();
                                let successMsg = that.resourceBundle.getText("requestNumber") + " " + requestNo + " " + that.resourceBundle.getText("requestDeletionSuccess");
                                that.showMessage(successMsg, "S", ["OK"], "OK", function (action) {
                                    if (action === "OK") {
                                        that.navigateTo(currentView);
                                    }
                                });
                            },
                            function () {
                                let errorMsg = that.resourceBundle.getText("requestNumber") + " " + requestNo + " " + that.resourceBundle.getText("requestDeletionError");
                                that.showMessage(errorMsg, "E", ["OK"], "OK", function (action) { });
                            });
                    }
                });
            },

            confirmPageNavigation: function (navigationTo) {
                // if (navigationTo == "Repository") {
                //     let Repository = this.getModelDetails("Repository");
                //     Repository.setProperty("/MaterialSelected/repoSubmitFor", null);
                //     Repository.setProperty("/MaterialSelected/showRepoFooterActions", false);
                // }
                this.navigateTo(navigationTo);
            },

            // Request Header Details 
            fnGetRequestHeaderData: function (dataFor) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    dataPath = `/RequestHeader/data/${dataFor}`,
                    data = null;
                try {
                    data = CreateProject.getProperty(dataPath);
                }
                catch (e) { data = null }
                return data;
            },

            fnGetMaterialDetailsSelectedData: function (dataFor) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    dataPath = `/MaterialList/selectedMaterialData/${dataFor}`,
                    data = null;
                try {
                    data = CreateProject.getProperty(dataPath);
                }
                catch (e) { data = null }
                return data;
            },

            //GetAllDetails
            onGetRequestData: async function (selectedRequestNo) {
                var that = this,
                    requestManagement = this.getModelDetails("RequestManagement"),
                    createProject = this.getModelDetails("CreateProject"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    reqHeaderEditability = {},
                    isUserRequestOwner = createProject.getProperty("/GeneralData/isUserRequestOwner"),
                    URL = "MM_JAVA/getAllDetails?requestNumber=" + selectedRequestNo;
                await this.fnProcessDataRequest(URL, "GET", null, true, null,
                    async function (responseData) {
                        if (responseData.result) {
                            let createProjData = responseData.result,
                                requestHeader = {},
                                reqChangeLog = [],
                                orgData = [],
                                matList = [];
                            if (createProjData?.requestHeaderDto) {
                                let reqHeaderData = createProjData.requestHeaderDto;
                                requestHeader = {
                                    "requestNumber": reqHeaderData.requestNumber,
                                    "requestType": reqHeaderData.requestTypeId,
                                    "requestDescription": reqHeaderData.requestDescription,
                                    "materialType": reqHeaderData.materialTypeId,
                                    "reqSubType": reqHeaderData.requestSubTypeId,
                                    "requestStatus": reqHeaderData.requestStatusId,
                                    "requestorOrganization": reqHeaderData.requestorOrganization,
                                    "priority": reqHeaderData.priority,
                                    "createdOn": reqHeaderData.createdOn,
                                    "createdBy": reqHeaderData.createdBy,
                                    "changedOn": reqHeaderData.changedOn,
                                    "changedBy": reqHeaderData.changedBy,
                                    "scenario": 2,//to update the request 
                                    "parentRequestNumber": reqHeaderData?.parentRequestNumber,
                                    "rootRequestNumber": reqHeaderData?.rootRequestNumber,
                                    "workflowInstanceId": reqHeaderData?.workflowInstanceId
                                }
                                that.onLoadRequestSubtype(reqHeaderData.requestTypeId);//To load request subtype rules
                                //To handle editability of request header in different scenarios
                                if (wfTaskType === "Request_Form_Submission" && reqHeaderData.requestStatusId === 1 && isUserRequestOwner
                                    || wfTaskType === "Requester_Rework_WF_Task" || wfTaskType === "GMDM_WF_Task") {
                                    reqHeaderEditability = {
                                        "requestDescription": true,
                                        "requestDate": true,
                                        "materialType": false,
                                        "requestType": false,
                                        "reqSubType": false,
                                        "requestorOrganization": false
                                    }
                                }
                                else {
                                    reqHeaderEditability = {
                                        "requestDescription": false,
                                        "requestDate": false,
                                        "materialType": false,
                                        "requestType": false,
                                        "reqSubType": false,
                                        "requestorOrganization": false
                                    }
                                }
                                createProject.setProperty("/RequestHeader/editable", reqHeaderEditability);
                                createProject.setProperty("/RequestHeader/data", requestHeader);
                                if (reqHeaderData.requestNumber) {
                                    await that.ongetAllMaterialList(reqHeaderData.requestNumber);
                                }
                                if (reqHeaderData?.materialTypeId) {
                                    // that.baseUomRuleFilter(reqHeaderData?.materialTypeId);
                                }
                                createProject.setProperty("/RequestHeader/oldData", JSON.parse(JSON.stringify(reqHeaderData)));
                                let materialList = createProject.getProperty("/MaterialList/materialList");
                                //On set selection of the new row - internal Calls press Event - onClickMaterialListItem
                                if (materialList?.length) {
                                    createProject.getProperty("/createProjectMaterialListId")?.setSelectedIndex(0);
                                }
                            }
                            if (createProjData?.childRequestDtos) {
                                let childRequestDtos = createProjData?.childRequestDtos || null;
                                if (childRequestDtos && childRequestDtos.length > 0) {
                                    createProject.setProperty("/RequestHeader/childRequestDetails/data", childRequestDtos);
                                    createProject.setProperty("/RequestHeader/childRequestDetails/visible", true);
                                }
                            }
                            if (createProjData?.changeLogDtos) {
                                reqChangeLog = createProjData?.changeLogDtos;
                                createProject.setProperty("/requestChangeHistory/historyDetails", reqChangeLog);
                            }
                            createProject.setProperty("/RequestHeader/savedData", JSON.parse(JSON.stringify(requestHeader)));
                            requestManagement.setProperty("/source", "requestManagement");

                            createProject.setProperty("/productDataOutline", null);
                            that.getWorkflowDetails(selectedRequestNo, "CreateProject", "materialmasterworkflow");
                            that.navigateTo("CreateProject");
                            that.closeBusyDialog();
                        }
                    },
                    function (responseData) { });
            },

            ongetAllMaterialList: function (requestNo) {
                return new Promise((resolve) => {
                    var CreateProject = this.getModelDetails("CreateProject"),
                        wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                        requestType = this.fnGetRequestHeaderData("requestType"),
                        url = `MM_JAVA/getAllMaterialListByRequestNumber?requestNumber=${requestNo}`,
                        that = this,
                        s_WF_GMDM = "GMDM_WF_Task",
                        s_WF_GQMD = "GQMD_WF_Task",
                        s_WF_Flex = "Flex_WF_Task",
                        s_WF_Requestor = "Request_Form_Submission",
                        s_WF_Rework = "Requester_Rework_WF_Task",
                        id_MS_Draft = 1,
                        id_MS_Inprogress = 2,
                        id_MS_Commited_To_Repo_NotSyndicated = 10,
                        id_MS_Commited_To_Repo_SyndicatedError = 11,
                        id_MS_SyndicationFailed = 16;
                    this.fnProcessDataRequest(url, "GET", null, true, null,
                        async function (responseData) {
                            for (let i = 0; i < responseData.length; i++) {
                                let currentData = responseData[i],
                                    included = currentData["included"],
                                    materialStatusId = currentData["materialStatusId"],
                                    visibility = {
                                        "include": true,
                                        "validate": false,
                                        "save": false,
                                        "commitToRepo": false,
                                        "syndicate": false,
                                        "delete": false
                                    },
                                    enability = {
                                        "include": false,
                                        "validate": true,
                                        "save": true,
                                        "commitToRepo": true,
                                        "syndicate": true,
                                        "delete": true
                                    };
                                currentData["line"] = (i + 1) * 10;
                                // To enable Include Column :
                                if (!included) {
                                    enability.include = false
                                }
                                else {
                                    if (wfTaskType === s_WF_GMDM && materialStatusId === id_MS_Inprogress) {
                                        enability.include = true
                                    }
                                    else if (wfTaskType === s_WF_GQMD && (materialStatusId === id_MS_Commited_To_Repo_SyndicatedError || materialStatusId === id_MS_Commited_To_Repo_NotSyndicated)) {
                                        enability.include = true
                                    }
                                }

                                // For Save Button  and Validate & Save Button
                                if (wfTaskType == s_WF_Requestor && (materialStatusId == id_MS_Draft || materialStatusId == null)) {
                                    visibility.save = true;
                                    visibility.validate = true;
                                }
                                else if ((wfTaskType == s_WF_GMDM || wfTaskType == s_WF_Rework) && (materialStatusId == id_MS_Inprogress)) {
                                    visibility.save = true;
                                    visibility.validate = true;
                                }

                                //For Commit to Repo
                                if (requestType == 1 && wfTaskType == s_WF_GMDM && (materialStatusId == id_MS_Inprogress)) {
                                    visibility.commitToRepo = true;
                                }

                                //For Syndicate
                                if (requestType == 1 && (wfTaskType === s_WF_GMDM || wfTaskType === s_WF_GQMD) && (materialStatusId === id_MS_Commited_To_Repo_SyndicatedError || materialStatusId === id_MS_Commited_To_Repo_NotSyndicated || materialStatusId === id_MS_SyndicationFailed)) {
                                    visibility.syndicate = true;
                                }

                                //For Delete
                                if (wfTaskType == s_WF_Requestor && (materialStatusId == id_MS_Draft || materialStatusId == null)) {
                                    visibility.delete = true;
                                }

                                currentData["visibility"] = visibility;
                                currentData["enability"] = enability;
                                responseData[i] = currentData;
                            }
                            CreateProject.setProperty("/MaterialList/materialList", JSON.parse(JSON.stringify(responseData)));
                            that.fnEnableAddBtn_ML(responseData);
                            if (responseData?.length > 0) {
                                CreateProject.setProperty("/MaterialList/visible/MaterialDetails", true);
                            }
                            else {
                                CreateProject.setProperty("/MaterialList/visible/MaterialDetails", false);
                            }
                            try {
                                let selectedPath = CreateProject.getProperty("/MaterialList/selectedPath"),
                                    selectedIndex = parseInt(selectedPath?.slice(selectedPath?.lastIndexOf('/') + 1));
                                CreateProject.setProperty("/MaterialList/selectedMaterialData", responseData[selectedIndex]);
                                CreateProject.setProperty("/MaterialList/selectedMaterialDataCopy", JSON.parse(JSON.stringify(responseData[selectedIndex])));
                                if (responseData?.length > 0) {
                                    if (that.byId("createProjectMaterialListId")) {
                                        that.byId("createProjectMaterialListId")?.clearSelection();
                                        that.byId("createProjectMaterialListId")?.setSelectedIndex(selectedIndex);
                                    }
                                    else {
                                        let materialListId = responseData[selectedIndex]?.materialListId;
                                        if (materialListId) {
                                            that.getDatabyMaterialListId(materialListId);
                                        }
                                    }
                                }
                            }
                            catch (e) { }
                            that.closeBusyDialog();
                            resolve(true);
                        },
                        function (responseData) {
                            resolve(true);
                            that.closeBusyDialog();
                        }
                    );
                })
            },

            fnEnableAddBtn_ML: function (MaterialListData) {
                var CreateProject = this.getModelDetails("CreateProject"),
                    parentRequestNumber = CreateProject.getProperty("/RequestHeader/data/parentRequestNumber");
                if (parentRequestNumber) {
                    CreateProject.setProperty("/MaterialList/addBtnEnable", false);
                    return;
                }
                try {
                    if (MaterialListData === null || MaterialListData === undefined || MaterialListData.length === 0) {
                        CreateProject.setProperty("/MaterialList/addBtnEnable", true);
                        return;
                    }
                }
                catch (e) { }
                var MaterialListDatalength = MaterialListData.length;
                if (MaterialListDatalength > 0 && (MaterialListData[MaterialListDatalength - 1].materialStatusId == null)) {
                    CreateProject.setProperty("/MaterialList/addBtnEnable", false);
                    return;
                }
                CreateProject.setProperty("/MaterialList/addBtnEnable", true);
                return;
            },

            // For Product Data field Dynamic UI
            fnCreatePanel: function (panelHeader) {
                var cPanel = new sap.m.Panel({
                    expandable: true,
                    expanded: true,
                    headerToolbar: [
                        new sap.m.Toolbar({
                            content: [
                                new sap.m.Title({
                                    text: "{i18n>" + panelHeader + "}"
                                })
                            ]
                        })
                    ]
                });
                cPanel.addStyleClass("MM_panel sapUiSmallMarginEnd sapUiTinyMarginBottom");
                return cPanel;
            },

            fnCreateGrid: function (isLongDescClass) {
                var cGrid = new sap.ui.layout.Grid({
                    defaultSpan: "XL3 L3 M6 S12"
                });
                if (isLongDescClass) {
                    cGrid = new sap.ui.layout.Grid({
                        defaultSpan: "XL6 L6 M12 S12"
                    });
                }
                cGrid.addStyleClass("MM_Grid");
                return cGrid;
            },

            fnCreateVBox: function (P_Visible) {
                var cVBox = new sap.m.VBox({
                    visible: P_Visible
                });
                return cVBox;
            },

            fnCreateLabel: function (PP_LabelName, PP_Mandatory) {
                var cLabel = new sap.m.Label({
                    text: PP_LabelName,
                    required: PP_Mandatory
                });
                cLabel.addStyleClass("MM_Label");
                return cLabel;
            },

            fnCreateInput: function (fieldName, PP_Value, PP_PlaceholderText, P_MaxChar, PP_Editable, P_FieldType, PP_ValueState, P_Header, Global_this) {
                let cInput = new sap.m.Input({
                    width: "100%",
                    value: PP_Value,
                    valueState: PP_ValueState,
                    placeholder: PP_PlaceholderText,
                    maxLength: P_MaxChar,
                    editable: PP_Editable,
                    type: P_FieldType
                }),
                    oAppModel = Global_this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    requestType = null;
                if (currentView == "Repository") {
                    let Repository = this.getModelDetails("Repository"),
                        repoEditIsFor = Repository.getProperty("/MaterialSelected/repoSubmitFor");
                    requestType = (repoEditIsFor == "Extend") ? 2 : 3;
                } else {
                    requestType = Global_this.fnGetRequestHeaderData("requestType");
                }
                if (requestType == 1 || requestType == 3) {
                    //Global_Material_Description
                    if (fieldName === "1016") {
                        let fnChange = function (oEvent) {
                            let sValue = oEvent.getParameter("value"),
                                MaterialDetails = Global_this.getModelDetails("MaterialDetails"),
                                materialData = MaterialDetails.getData(),
                                systemData = materialData?.SystemData?.selectedSystems;

                            if (systemData) {
                                for (let targetSystem in systemData) {
                                    let currentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}`);
                                    if (currentSystemDetails) {
                                        let descriptionDataList = currentSystemDetails?.AdditionalData?.descriptionData?.data || [],
                                            isPresent = false;
                                        if (descriptionDataList.length > 0) {
                                            for (let item in descriptionDataList) {
                                                if (descriptionDataList[item].MM_LANGUAGE === "Z1") {
                                                    descriptionDataList[item].MM_MATERIAL_DESCRIPTION_MAKT_MAKTX = sValue;
                                                    isPresent = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (!isPresent && sValue) {
                                            let newItem = {
                                                "MM_LANGUAGE": "Z1",
                                                "MM_MATERIAL_DESCRIPTION_MAKT_MAKTX": sValue
                                            }
                                            descriptionDataList.push(newItem);
                                        }
                                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}/AdditionalData/descriptionData/data`, descriptionDataList);
                                    }
                                }
                            }
                        }
                        cInput.attachChange(fnChange);
                    }
                }
                cInput.addStyleClass("MM_InputText");
                cInput.attachLiveChange(this.onAddingMandatoryValue, this);
                return cInput;
            },

            fnCreateTextArea: function (fieldName, PP_Value, PP_PlaceholderText, P_MaxChar, PP_Editable, P_FieldType, PP_ValueState, Global_this) {
                let cTextArea = new sap.m.TextArea({
                    width: "100%",
                    rows: 4,
                    value: PP_Value,
                    valueState: PP_ValueState,
                    placeholder: PP_PlaceholderText,
                    maxLength: P_MaxChar,
                    editable: PP_Editable
                }), oAppModel = Global_this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    requestType = null;
                if (currentView == "Repository") {
                    let Repository = this.getModelDetails("Repository"),
                        repoEditIsFor = Repository.getProperty("/MaterialSelected/repoSubmitFor");
                    requestType = (repoEditIsFor == "Extend") ? 2 : 3;
                } else {
                    requestType = Global_this.fnGetRequestHeaderData("requestType");
                }
                if (requestType == 1 || requestType == 3) {
                    //Global_Material_Long_Description
                    if (fieldName === "1017") {
                        let fnChange = function (oEvent) {
                            let sValue = oEvent.getParameter("value"),
                                MaterialDetails = Global_this.getModelDetails("MaterialDetails"),
                                materialData = MaterialDetails.getData(),
                                systemData = materialData?.SystemData?.selectedSystems;
                            if (systemData) {
                                for (let targetSystem in systemData) {
                                    let currentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}`);
                                    if (currentSystemDetails) {
                                        let basicDataTextList = currentSystemDetails?.AdditionalData?.basicDataText?.data || [],
                                            isPresent = false;
                                        if (basicDataTextList.length > 0) {
                                            for (let item in basicDataTextList) {
                                                if (basicDataTextList[item].MM_LANGUAGE === "Z1") {
                                                    basicDataTextList[item].MM_MATERIAL_LONG_DESC_STXH_TDNAME = sValue;
                                                    isPresent = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (!isPresent && sValue) {
                                            let newItem = {
                                                "MM_LANGUAGE": "Z1",
                                                "MM_MATERIAL_LONG_DESC_STXH_TDNAME": sValue
                                            }
                                            basicDataTextList.push(newItem);
                                        }
                                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}/AdditionalData/basicDataText/data`, basicDataTextList);
                                    }
                                }
                            }
                        }
                        cTextArea.attachChange(fnChange);
                    }
                }
                cTextArea.addStyleClass("MM_TextArea");
                cTextArea.attachLiveChange(this.onAddingMandatoryValue, this);
                return cTextArea;
            },

            fnCreateMultiComboBox: function (fieldName, PP_SelectedKeys, PP_PlaceholderText, PP_Items, PP_ItemKey, PP_ItemDesc, PP_ItemCode, P_SecValue, PP_Editable, PP_ValueState, Global_this) {
                let requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    requestSource = this.getRequestSource(),
                    fChangeEvent = function (oEvent) {
                        let selectedPath = oEvent.getSource().getBindingInfo("selectedKeys").binding.sPath;
                        Global_this.onLoadOtherFieldsDynamically(selectedPath);

                        if (fieldName === "1024") {
                            let sValue = oEvent.getSource().getProperty("selectedKeys"),
                                changedItem = oEvent.getParameter("changedItem").getKey(),
                                MaterialDetails = Global_this.getModelDetails("MaterialDetails");

                            let extractNumbersAsArray = (inputArray) => {
                                return inputArray
                                    .map(item => {
                                        let match = item.match(/\d+/);
                                        return match ? match[0] : null;
                                    })
                                    .filter(Boolean);
                            };

                            let processDependentRuleData = (key, apiKey) => {
                                let alternateIdData = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedIDs"),
                                    payload = {
                                        "requestNumber": requestNumber || null,
                                        "key": apiKey,
                                        "applicableIn": requestSource
                                    }

                                Global_this.fnProcessDataRequest("MM_JAVA/getDependentRuleData", "POST", null, true, payload,
                                    function (responseData) {
                                        if (responseData) {
                                            let dependentAlternateIDs = extractNumbersAsArray(responseData);

                                            dependentAlternateIDs.forEach(alternateId => {
                                                // let idExists = alternateIdData.some(item => item?.Alternate_ID_Type === alternateId);

                                                // if (!idExists) {
                                                let newAlternateIdData = {
                                                    ...MaterialDetails.getProperty("/ProductDataStatic/alternateID/newIDData"),
                                                    Alternate_ID_Type: alternateId
                                                };
                                                alternateIdData.push(newAlternateIdData);
                                                // }
                                            });

                                            MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedIDs", alternateIdData);
                                        }
                                        Global_this.closeBusyDialog();
                                    },
                                    function (responseData) {
                                        Global_this.closeBusyDialog();
                                    }
                                );
                            };

                            if (sValue?.includes("107") && changedItem?.includes("107")) {
                                processDependentRuleData("107", "67");
                            }

                            if (sValue?.includes("162") && changedItem?.includes("162")) {
                                processDependentRuleData("162", "68");
                            }
                        }
                        Global_this.sortMultiComboValues(fieldName, PP_SelectedKeys);   //Commented for now, uncomment when required
                    }
                let cMultiComboBox = new sap.m.MultiComboBox({
                    width: "100%",
                    showSecondaryValues: P_SecValue,
                    filterSecondaryValues: true,
                    items: {
                        path: PP_Items,
                        template: new sap.ui.core.ListItem({
                            key: PP_ItemKey,
                            text: `${PP_ItemCode} - ${PP_ItemDesc}`
                            // additionalText: PP_ItemCode
                        })
                    },
                    editable: PP_Editable,
                    selectedKeys: PP_SelectedKeys,
                    placeholder: PP_PlaceholderText,
                    valueState: PP_ValueState,
                    selectionChange: fChangeEvent
                });
                cMultiComboBox.addStyleClass("MM_MultiComboBox");
                cMultiComboBox.attachBrowserEvent("mouseover", function () {
                    let tooltipText = [];
                    cMultiComboBox.getSelectedItems().map(function (item) {
                        tooltipText.push(item.mProperties.text);
                    })
                    cMultiComboBox.setTooltip(tooltipText.join());
                });
                cMultiComboBox.attachSelectionFinish(this.onAddingMandatoryValue.bind(this));
                return cMultiComboBox;
            },

            fnCreateCheckbox: function (PP_Selected, PP_Text, PP_Editable, Global_this) {

                let cCheckbox = new sap.m.CheckBox({
                    selected: PP_Selected,
                    // selected: "{= ${PP_Selected} == true ? true : false}",
                    //  selected: { path: PP_Selected, formatter: formatter.onConvertBooleanType },
                    text: PP_Text,
                    tooltip: PP_Text,
                    editable: PP_Editable
                }),
                    MaterialDetails = Global_this?.getModelDetails("MaterialDetails"),
                    fnSelect = function (oEvent) {
                        let cCheckboxSelected = oEvent?.getSource()?.getSelected(),
                            sPath = oEvent?.getSource()?.getBindingInfo("selected")?.binding?.sPath;
                        MaterialDetails.setProperty(sPath, cCheckboxSelected);
                    }
                cCheckbox.attachSelect(fnSelect);
                cCheckbox.addStyleClass("MM_Checkbox");
                return cCheckbox;
            },

            fnCreateInputWithSuggestionBtn: function (PP_Value, PP_PlaceholderText, P_MaxChar, P_Editable, P_FieldType, PP_ValueState, P_ShowSuggestion, fieldName, PP_Editable) {
                let that = this,
                    PP_Formatter_Editable = PP_Editable.slice(1, -1); // truncating curly brackets to pass to the formatter funciton;
                let cHbox = new sap.m.HBox({
                    renderType: "Bare"
                });
                let cInput = new sap.m.Input({
                    width: "100%",
                    value: PP_Value,
                    valueState: PP_ValueState,
                    placeholder: PP_PlaceholderText,
                    maxLength: P_MaxChar,
                    editable: {
                        path: PP_Formatter_Editable,
                        formatter: function (isEditable) {
                            return that.onSetCSS_StyleforTreeInput(isEditable, cInput);
                        }.bind(this)
                    },
                    type: P_FieldType,
                    customData: [
                        new sap.ui.core.CustomData({
                            key: "isValueState",
                            value: PP_ValueState,
                            writeToDom: true
                        })
                    ]
                });

                cInput?.addEventDelegate({
                    onAfterRendering: function () {
                        if (cInput?.getValue()) {
                            cInput.addStyleClass("customNoneStyle");
                        } else {
                            cInput.removeStyleClass("customNoneStyle");
                        }
                    }
                });

                cHbox.addItem(cInput);
                let oButton = new sap.m.Button({
                    icon: "sap-icon://value-help",
                    press: P_ShowSuggestion,
                    enabled: PP_Editable
                });
                //To store the fieldName while button was created
                //Because the field Name is required in order to call
                //the hierarchical attributes function
                oButton.addCustomData(new sap.ui.core.CustomData({
                    key: "fieldName",
                    value: fieldName
                }));
                cHbox.addItem(oButton);
                return cHbox;
            },

            onSetCSS_StyleforTreeInput: function (isEdit, elementreference) {
                try {
                    if (isEdit) {
                        elementreference.addStyleClass("MM_InputText_withBtn");
                    }
                    else {
                        elementreference.addStyleClass("MM_InputText");
                    }
                }
                catch (e) { }
                return false;
            },

            fnCreateInput_Suggestion: function (PP_Value, PP_PlaceholderText, P_MaxChar, PP_Editable, P_FieldType, PP_ValueState, PP_Item, PP_ItemKey, PP_ItemDesc, P_Header, Global_this, showSuggestion, suggestionItemSelected) {
                let cInput = new sap.m.Input({
                    editable: PP_Editable,
                    valueState: PP_ValueState,
                    width: "100%",
                    selectedKey: PP_Value,
                    placeholder: PP_PlaceholderText,
                    maxLength: P_MaxChar,
                    type: P_FieldType,
                });
                cInput.addStyleClass("MM_InputText");

                if (showSuggestion) {
                    cInput.setShowSuggestion(true);

                    cInput.bindAggregation("suggestionItems", {
                        path: PP_Item,
                        template: new sap.ui.core.Item({
                            key: PP_ItemKey,
                            text: PP_ItemDesc
                        })
                    });
                    if (suggestionItemSelected && typeof suggestionItemSelected === 'function') {
                        cInput.attachSuggestionItemSelected(suggestionItemSelected);
                    }
                }
                return cInput;
            },

            fnCreateDatePicker: function (PP_Value, PP_PlaceholderText, P_Editable, PP_ValueState, change = (oEvent) => { }) {
                let cDatePicker = new sap.m.DatePicker({
                    width: "100%",
                    value: PP_Value,
                    valueFormat: "yyyy-MM-dd HH:mm:ss",
                    editable: P_Editable,
                    valueState: PP_ValueState,
                    displayFormat: "yyyy-MM-dd",
                    placeholder: PP_PlaceholderText,
                    change: change,
                });
                cDatePicker.addStyleClass("MM_DatePicker");
                return cDatePicker;
            },

            fnCreateComboBox: function (lookupRuleName, fieldName, PP_Key, placeholderText, PP_Item, PP_ItemKey, PP_ItemDesc, PP_ItemCode, P_SecValue, PP_Editable, PP_ValueState, Global_this) {
                let requestType = Global_this.fnGetRequestHeaderData("requestType"),
                    fChangeEvent = function (oEvent) {
                        let selectedPath = oEvent.getSource().getBindingInfo("selectedKey").binding.sPath,
                            requestSource = Global_this.getRequestSource();
                        // Global_this.fnHandleComboboxValidation(oEvent);
                        Global_this.onLoadOtherFieldsDynamically(selectedPath);
                        //Base_UOM or Material_Lifecycle_Status
                        if (fieldName === "1009" || fieldName === "1025") {
                            let sValue = oEvent.getSource().getProperty("selectedKey"),
                                MaterialDetails = Global_this.getModelDetails("MaterialDetails"),
                                LookupModel = Global_this.getModelDetails("LookupModel"),
                                materialData = MaterialDetails.getData(),
                                systemData = materialData?.SystemData?.selectedSystems;

                            if (systemData) {
                                for (let targetSystem in systemData) {
                                    let currentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}`),
                                        systemId = systemData[targetSystem].MM_SYSTEM_ID;
                                    if (currentSystemDetails && sValue) {
                                        //Base_UOM
                                        if (fieldName === "1009" && ((requestType == 1 && requestSource == "Request_Management") || requestSource == "Repository")) {
                                            let updatedBaseUOMInfoText = Global_this.geti18nText("updatedBaseUOMInfoText");
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}/basicData1/generalData/data/MM_BASE_UNIT_OF_MEASURE_MARM_MEINS`, sValue);
                                            Global_this.fnUpdateAltUomDataMaterialAdd(systemId);
                                            MessageToast.show(updatedBaseUOMInfoText);
                                        }
                                        //Material_Lifecycle_Status
                                        else if (fieldName === "1025" && (((requestType == 1 || requestType == 3) && requestSource == "Request_Management") || requestSource == "Repository")) {
                                            let lifeCycleMapping = LookupModel.getProperty("/MM_MATERIAL_LIFE_CYCLE_STATUS_MAPPING_RULE"),
                                                mappedObj = {},
                                                MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = null;
                                            systemId = parseInt(systemId);
                                            try {
                                                mappedObj = lifeCycleMapping?.find(function (mapRule) {
                                                    let applicableSystemIDs = mapRule.MM_SYSTEM;
                                                    if (applicableSystemIDs?.includes(systemId) && mapRule?.MM_MATERIAL_LIFE_CYCLE_STATUS_MAPPING_RULE_CODE == sValue) {
                                                        return mapRule;
                                                    }
                                                })
                                                MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = mappedObj?.MM_X_PLANT_MATERIAL_STATUS;
                                                // if (systemId == "2" && sValue == "2") {
                                                //     MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}/basicData1/generalData/data/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`, null);
                                                // } else {
                                                // MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}/basicData1/generalData/data/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`, MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE);
                                                // }                                         
                                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}/basicData1/generalData/data/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`, MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE);
                                            } catch (e) { }
                                        }
                                    }
                                }
                            }
                        }
                        else if (fieldName === "API") {
                            let APIFieldMapping = LookupModel.getProperty("/MM_API_REF_LIST"),
                                mappedObj = {};
                            try {
                                mappedObj = APIFieldMapping?.find(function (mapRule) {
                                    let saltFieldVisible = MaterialDetails.getProperty("/ProductData/Hierarchical_Attributes/MM_VISIBILITY/salt"),
                                        moleculeFIeldVisible = MaterialDetails.getProperty("/ProductData/Hierarchical_Attributes/MM_VISIBILITY/molecule");
                                    if (applicableSystemIDs?.includes(systemId) && mapRule?.MM_MATERIAL_LIFE_CYCLE_STATUS_MAPPING_RULE_CODE == sValue) {
                                        return mapRule;
                                    }
                                    if (moleculeFIeldVisible) { }
                                })
                                MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = mappedObj?.MM_X_PLANT_MATERIAL_STATUS;
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemData[targetSystem].MM_SYSTEM_ID}/basicData1/generalData/data/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`, MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE);
                            } catch (e) { }
                        }
                    },
                    LookupModel = Global_this.getModelDetails("LookupModel"),
                    codeColumnNonMandRefList = LookupModel.getProperty("/codeColumnNonMandRefList/nonMandList"),
                    isNonMandRefListPresent = false;
                codeColumnNonMandRefList.map(item => {
                    if (item?.refListName == lookupRuleName) {
                        isNonMandRefListPresent = true;
                    }
                });
                let cComboBox = new sap.m.ComboBox({
                    selectedKey: PP_Key,
                    valueState: PP_ValueState,
                    placeholder: placeholderText,
                    editable: true,
                    width: "100%",
                    showSecondaryValues: P_SecValue,
                    filterSecondaryValues: true,
                    editable: PP_Editable,
                    items: {
                        path: PP_Item,
                        template: new sap.ui.core.ListItem({
                            key: PP_ItemKey,
                            text: isNonMandRefListPresent ? `${PP_ItemDesc}` : `${PP_ItemCode} - ${PP_ItemDesc}`
                            // additionalText: PP_ItemKey
                        })
                    },
                    change: fChangeEvent
                });

                cComboBox.addStyleClass("MM_ComboBox");
                cComboBox.attachSelectionChange(this.onAddingMandatoryValue, this);
                return cComboBox;
            },

            fnCreateTree: function (PP_Path, PP_Text, PP_Selected, fieldName, PP_Selected_Text, PP_Selected_Key, Global_this, handleNodePress = () => { }) {
                // var Treeid = fieldName + "_treeId";
                var PP_Selected_Key_With_Model = "MaterialDetails>" + PP_Selected_Key;
                var cTree = new sap.m.Tree("", {
                    selectionChange: handleNodePress.bind(this, PP_Selected_Text, PP_Selected_Key, Global_this),
                    items: {
                        path: PP_Path,
                        template: new sap.m.CustomTreeItem({
                            content: new sap.m.FlexBox({
                                alignItems: sap.m.FlexAlignItems.Start,
                                width: '100%',
                                items: new sap.m.Text({
                                    text: PP_Text
                                })
                            }),
                            selected: {
                                parts: [PP_Selected, PP_Selected_Key_With_Model],
                                formatter: this.onSetSelectedItemForTree.bind(this)
                            }
                        }),
                    },
                    mode: sap.m.ListMode.SingleSelectLeft,
                    rememberSelections: false

                });
                // cTree.addStyleClass("MM_Tree");
                return cTree;
            },

            onSetSelectedItemForTree: function (currentNodeID, selectedNodeId) {
                if (currentNodeID)
                    return currentNodeID == selectedNodeId;
                return false;
            },

            fnMakeIterableArray: function (obj) {
                const resultArray = [];
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        resultArray.push({ key: key, value: obj[key] });
                    }
                }
                return resultArray;
            },


            fnValidateMaterialData: async function () {
                return new Promise((resolve) => {
                    // UI Mandatory Validation
                    var MaterialDetails = this.getModelDetails("MaterialDetails"),
                        materialData = MaterialDetails.getData(),
                        tabData = {},
                        isValidated = true,
                        aTabValidation = [];
                    MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", []);
                    for (let tab in materialData) {
                        isValidated = true;
                        switch (tab) {
                            case "ProductData":
                                tabData = materialData?.ProductData;
                                let isValidProductData = this.fnToValidateEachField(tabData, tab);
                                isValidated = isValidProductData === false ? isValidProductData : isValidated;
                                aTabValidation.push(isValidated);
                                break;

                            case "OrganizationalData":
                                tabData = materialData?.OrganizationalData?.selectedPlants;
                                let wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                                    isValidOrgData;
                                if (wfTaskType == "GMDM_WF_Task") {
                                    isValidOrgData = this.fnToValidateOrgData(tabData);
                                }
                                else {
                                    isValidOrgData = true;
                                }
                                isValidated = isValidOrgData === false ? isValidOrgData : isValidated;
                                aTabValidation.push(isValidated);
                                break;

                            case "AggregatedSystemDetails":
                                for (let system in materialData[tab]) {
                                    for (let sTab in materialData[tab][system]) {
                                        switch (sTab) {
                                            case "basicData1":
                                                tabData = materialData?.AggregatedSystemDetails[system]?.basicData1;
                                                let isValidBasicData1 = this.fnToValidateBasicData1(system, tabData, sTab),
                                                    isGrossWeightNetWeightValidated = true,
                                                    obj = materialData.SystemData.selectedSystems.filter(item => item.MM_SYSTEM_ID == system)[0],
                                                    isIncluded = obj.isIncluded,
                                                    markedForSyndication = obj.markForSyndication;
                                                if (isIncluded && markedForSyndication) {
                                                    isGrossWeightNetWeightValidated = this.fnToValidateGrossWtNetWt(system, tabData.dimensionsEans.data);
                                                }
                                                isValidated = isValidBasicData1 && isGrossWeightNetWeightValidated;
                                                aTabValidation.push(isValidated);
                                                break;

                                            case "basicData2":
                                                tabData = materialData?.AggregatedSystemDetails[system]?.basicData2;
                                                let isValidBasicData2 = this.fnToValidateBasicData2(system, tabData, tab);
                                                isValidated = isValidBasicData2;
                                                aTabValidation.push(isValidated);
                                                break;

                                            case "AdditionalData":
                                                tabData = materialData?.AggregatedSystemDetails[system]?.AdditionalData;
                                                let systemDataObj = materialData?.SystemData?.selectedSystems?.filter(item => item.MM_SYSTEM_ID == system)[0],
                                                    aIncluded = systemDataObj?.isIncluded,
                                                    aMarkedForSyndication = systemDataObj?.markForSyndication,
                                                    isValidAdditionalData = true,
                                                    altUomData = materialData?.AggregatedSystemDetails[system]?.AdditionalUOM;
                                                if (aIncluded && aMarkedForSyndication) {
                                                    isValidAdditionalData = this.fnToValidateAdditionalTabField(system, tabData, altUomData);
                                                }
                                                isValidated = isValidAdditionalData;
                                                aTabValidation.push(isValidated);
                                                break;
                                        }
                                    }
                                }
                                isValidated = aTabValidation.find(e => e === false) === false ? false : true;
                                resolve(isValidated);
                        }
                    }
                });

            },

            onSaveMaterialList: function (oEvent) {
                var that = this,
                    isMandatClassification = this.fnClassFieldsEmptyValidCheck();

                if (isMandatClassification != true) {
                    let modifiedClass = that.geti18nText("modifiedClass"),
                        classMandErrorMsg = that.geti18nText("classMandErrorMsg"),
                        proceedConfirmMsg = that.geti18nText("proceedConfirmMsg"),
                        errMsg = isMandatClassification?.map(item =>
                            `${item.systemId}: ${classMandErrorMsg} ${modifiedClass} ${item.className}`
                        ).join('\n\n');
                    MessageBox.error(errMsg, {
                        actions: [MessageBox.Action.CANCEL],
                        onClose: function (action) {
                            // if (action === MessageBox.Action.OK) {
                            //     that.fnToTriggerSaveMaterialList(oEvent);
                            // }
                        }
                    });
                    return Promise.resolve(false);
                } else {
                    return this.fnToTriggerSaveMaterialList(oEvent);
                }
            },

            fnToTriggerSaveMaterialList: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    oView = this.getView(),
                    frameDtoFor = "Validate",
                    bShowMsg = true,
                    that = this,
                    currentView = this.getViewName();

                if(currentView == "CreateProject"){
                    var CreateProject = this.getModelDetails("CreateProject"),
                        path = oEvent.getSource().getBindingContext("CreateProject").sPath,
                        index = parseInt(path.split('/').pop(), 10),
                        materialList = CreateProject.getProperty("/MaterialList/materialList")
                }

                MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", []);

                return this.fnValidateMaterialData().then(function (isValidated) {
                    if(currentView == "CreateProject"){
                        if (isValidated) {
                            //get the resolve returns from duplicate function
                            return that.fnCheckDuplicateMaterial().then((isDuplicateMaterialsFound) => {
                                if (isDuplicateMaterialsFound) {
                                    //show duplicate material dialog
                                    that.LoadFragment("DuplicateMaterial", oView);
                                    return false
                                } else {
                                    that.fnPostMaterialDetails(frameDtoFor, bShowMsg);
                                    return true;
                                }
                            });
                        }
                        else {
                            materialList[index].validated = false;
                            that.LoadFragment("MD_MissingMandatoryField", oView, true);
                            return false;
                        }
                    }
                    else if(currentView== "Repository"){
                        if(isValidated){
                            return true;
                        }
                        else{
                            that.LoadFragment("MD_MissingMandatoryField", oView, true);
                            return false;
                        }
                    }
                });
            },

            //Save as Draft
            //Save as draft moved to Base controller as we are using it in System Details view and Create Project both
            onSaveasDraftMaterialList: function (oEvent) {
                var frameDtoFor = "Save";
                this.fnPostMaterialDetails(frameDtoFor);
            },

            fnPostMaterialDetails: function (frameDtoFor, bShowMsg = true) {
                return new Promise((resolve) => {
                    let that = this,
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                        matDetailsPayload = this.fnFrameMaterialDetailsOldNewDto(frameDtoFor);
                    this.fnProcessDataRequest("MM_JAVA/createOrUpdateSystemMaterialListDetails", "POST", null, true, matDetailsPayload,
                        async function (responseData) {
                            if (responseData?.statusCode == 200 || (responseData?.statusCode == 204 && responseData?.materialListId != null)) {
                                let successMsg,
                                    actions = ["OK"],
                                    updatedMaterialListDetailsDto = matDetailsPayload?.updatedMaterialListDetailsDto;
                                if (frameDtoFor === "Save" && bShowMsg) {
                                    successMsg = that.resourceBundle.getText("matDetails") + " " + that.resourceBundle.getText("succesMsgToSaveData");
                                    that.showMessage(successMsg, "S", actions, "OK", function (action) {
                                    });
                                }
                                if (frameDtoFor === "Validate" && bShowMsg) {
                                    successMsg = that.resourceBundle.getText("matDetails") + " " + that.resourceBundle.getText("successMsgToValidateData");
                                    that.showMessage(successMsg, "S", actions, "OK", function (action) {
                                    });
                                }
                                await that.ongetAllMaterialList(requestNumber);
                                MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData", JSON.parse(JSON.stringify(updatedMaterialListDetailsDto))); // To store the Old Material Data in a Model for Post inorder to capture change Logs.
                                resolve(true);
                                that.closeBusyDialog();
                            }
                            else {
                                let errorMsg = that.resourceBundle.getText("errorMsgToSaveData") + that.resourceBundle.getText("materialData"),
                                    actions = ["OK"];
                                that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                                });
                                resolve(false);
                                that.closeBusyDialog();
                            }
                        },
                        function (responseData) {
                            let errorMsg = that.resourceBundle.getText("errorMsgToSaveData") + that.resourceBundle.getText("materialData"),
                                actions = ["OK"];
                            that.showMessage(errorMsg, "E", actions, "OK", function (action) {
                            });
                            resolve(false);
                            that.closeBusyDialog();
                        });
                });
            },

            // only for "true" / "false" string
            stringToBoolean: function (value) {
                return value.toLowerCase() === "true";
            },

            getDatabyMaterialListId: function (materialListId) {
                return new Promise((resolve) => {
                    var url = `MM_JAVA/getSystemMaterialListDetailsByMaterialListId?materialListId=${materialListId}`,
                        that = this,
                        CreateProject = this.getModelDetails("CreateProject"),
                        oAppModel = this.getModelDetails("oAppModel"),
                        materialType = this.fnGetRequestHeaderData("materialType"),
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                        LookupModel = this.getModelDetails("LookupModel"),
                        listOfBaseUoms = LookupModel.getProperty("/MM_UOM_REF_LIST"),
                        viewName = this.getViewName(),
                        isUserRequestOwner = CreateProject.getProperty("/GeneralData/isUserRequestOwner"),
                        wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType");
                    //Remove classification class attributes.
                    this.fnRemoveClassificationClassAttributes();
                    this.fnProcessDataRequest(url, "GET", null, false, null,
                        async function (responseData) {
                            var responseBasicData1Dto, responseBasicData2Dto, responseproductDataDto,
                                orgData = [], systemData = [], basicData1Dto = {}, basicData2Dto = {}, materialRequestLogDto = [], eSignLogDto = [];

                            if (responseData?.targetSystem) {
                                Object.keys(responseData.targetSystem)?.forEach(key => {
                                    let systemResponseData = responseData.targetSystem[key];
                                    if (systemResponseData?.basicData1Dto) {
                                        delete systemResponseData?.basicData1Dto?.systemId;
                                        delete systemResponseData?.basicData1Dto?.materialNumber;
                                        delete systemResponseData?.basicData1Dto?.systemIdDesc;
                                    }
                                    else if (systemResponseData?.basicData2Dto) {
                                        delete systemResponseData?.basicData2Dto?.systemId;
                                        delete systemResponseData?.basicData2Dto?.materialNumber;
                                        delete systemResponseData?.basicData2Dto?.systemIdDesc;
                                    }
                                });
                            }

                            CreateProject.setProperty("/MaterialList/selectedMaterialData", responseData);
                            CreateProject.setProperty("/MaterialList/selectedMaterialDataCopy", JSON.parse(JSON.stringify(responseData))); // To store the Old Material Data in a Model for Post inorder to capture change Logs.
                            MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData", JSON.parse(JSON.stringify(responseData)));

                            if (responseData?.productData) {
                                responseproductDataDto = responseData?.productData;
                                for (let className in responseproductDataDto) {
                                    let classDetails = responseproductDataDto[className],
                                        classPath = `/ProductData/${className}`;
                                    // try {
                                    //     MaterialDetails.setProperty(`/ProductData/${className}/data`, classDetails);
                                    // }
                                    // catch { }
                                    var classDetailsCopy = JSON.parse(JSON.stringify(classDetails));
                                    MaterialDetails.setProperty(`/ProductData/${className}/oldData`, classDetailsCopy);
                                    for (let fieldName in classDetails) {
                                        let P_Data = classPath + "/data/" + fieldName,
                                            P_Tree_Data = classPath + "/Additional_Data/" + fieldName,
                                            P_Full_Path_Data = classPath + "/data/" + fieldName + "_Full_Path",
                                            P_Visible = classPath + "/MM_VISIBILITY/" + fieldName + "_Other",
                                            P_Visible_Full_Path = classPath + "/MM_VISIBILITY/" + fieldName + "_Full_Path",
                                            fieldTypePath = "/productDataOutline/" + className + "/MM_UI_FIELD_TYPE/" + fieldName,
                                            fieldType = CreateProject.getProperty(fieldTypePath),
                                            P_Other_Field_Option = classPath + "/MM_LOOKUP_OTHER_VALUE_OPTION/" + fieldName,
                                            V_Other_Field_Option = MaterialDetails.getProperty(P_Other_Field_Option), // ture /false
                                            V_Data = classDetails[fieldName],
                                            P_Full_Path = fieldName + "_Full_Path",
                                            V_Full_Path_Data = classDetails[P_Full_Path],
                                            // V_Data = MaterialDetails.getProperty(P_Data),
                                            // V_Full_Path_Data = MaterialDetails.getProperty(P_Full_Path_Data),
                                            Selected_Node_Text = V_Full_Path_Data?.split(">").pop();
                                        if (V_Other_Field_Option === true && (V_Data === "other" || V_Data?.toString()?.includes("other"))) {
                                            MaterialDetails.setProperty(P_Visible, true);
                                        }
                                        else {
                                            MaterialDetails.setProperty(P_Visible, false);
                                        }
                                        //For MultiComboBox, Backend sends only string values but we need to convert them to array in order to render in UI
                                        if (fieldType === "MultiComboBox") {
                                            // MaterialDetails.setProperty(P_Data, that.stringToArray(V_Data));
                                            classDetails[fieldName] = that.stringToArray(V_Data);
                                        }
                                        //For tree Full Path field visiblility handled as getFieldLayout does 
                                        //getFieldLayout does not provide the visibility for the same And
                                        //Setting the node text to tree field(from Node full path) as only key is saved in DB
                                        if (fieldType === "Tree") {
                                            MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}`, {})
                                            if (V_Data) {
                                                MaterialDetails.setProperty(P_Visible_Full_Path, true);
                                                MaterialDetails.setProperty(P_Tree_Data, Selected_Node_Text);
                                                if (V_Data != "other") {
                                                    that.getDependentAttributes(requestNumber, fieldName, V_Data);
                                                }
                                            }
                                        }
                                        if (fieldType === "CheckBox") {
                                            classDetails[fieldName] = JSON.parse(V_Data);
                                        }
                                    }
                                    MaterialDetails.setProperty(`/ProductData/${className}/data`, classDetails);
                                }

                            }

                            if (responseData?.productDataStatic) {
                                let alternateIdDto = responseData.productDataStatic.alternateIdDto;
                                let alternateID = [];
                                alternateIdDto.map(function (item) {
                                    var lineAlternateId = {
                                        "Alternate_ID_Type_Country": item.MM_ALTERNATE_ID_TYPE_COUNTRY,
                                        "Alternate_ID_Type": item.MM_ALTERNATE_ID_TYPE,
                                        "Field_Value": item.MM_ALTERNATE_ID_FIELD_VALUE,
                                        "isDeleted": item.isDeleted,
                                        "alternateId": item.MM_ALTERNATE_ID_TYPE,
                                        "materialListId": item.materialListId,
                                        "Request_Row_Id": item.MM_ALTERNATE_ID_REQUEST_ROW_ID,
                                        "Repository_Row_ID": item.MM_ALTERNATE_ID_REPOSITORY_ROW_ID,
                                        "MM_NEWLY_ADDED": item.MM_NEWLY_ADDED,
                                        "isModified": item?.isModified || false,
                                        "isActive": item.isActive || false
                                    }
                                    alternateID.push(lineAlternateId);
                                })


                                MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedIDs", alternateID);
                            }

                            if (responseData?.systemData) {
                                let aggregatedSystemDetails = responseData.targetSystem,
                                    systemData = responseData?.systemData,
                                    MaterialDetailsLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MaterialDetails.json"),
                                    MaterialDetailsLocalModel = new JSONModel(),
                                    MaterialDetailsLocalModelData;

                                that.getView().setModel(MaterialDetailsLocalModel, "MaterialDetailsLocalModel");
                                await MaterialDetailsLocalModel.loadData(MaterialDetailsLocation);

                                MaterialDetailsLocalModelData = MaterialDetailsLocalModel.getData();
                                for (let system in systemData) {
                                    let currentSystemId = systemData[system].MM_SYSTEM_ID,
                                        currentSystemDetails = aggregatedSystemDetails?.[currentSystemId];
                                    await that.fnToRenderOdataLookup(currentSystemId);
                                    await that.fnToRenderRulesLookup(materialType, currentSystemId);
                                    if (currentSystemDetails) {
                                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}`, JSON.parse(JSON.stringify(MaterialDetailsLocalModelData.SystemDetails)));
                                        //Basic Data 1
                                        if (currentSystemDetails?.basicData1Dto) {
                                            responseBasicData1Dto = currentSystemDetails.basicData1Dto;
                                            //let xPlantVal = responseBasicData1Dto?.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE == "" ? "BLANK" : responseBasicData1Dto?.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE,
                                            let baseUomMappedObj = listOfBaseUoms?.find(item => {
                                                if (item?.MM_KEY == responseBasicData1Dto?.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS) {
                                                    return item;
                                                }
                                            }),
                                                baseUomVal = baseUomMappedObj?.MM_UOM_REF_LIST_CODE;
                                            MaterialDetails.setProperty(`/SystemData/BasicData1BaseUom/${currentSystemId}`, {});
                                            MaterialDetails.setProperty(`/SystemData/BasicData1BaseUom/${currentSystemId}/prevSelectedVal`, baseUomVal);
                                            basicData1Dto = {
                                                "generalData": {
                                                    "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS": responseBasicData1Dto.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS,
                                                    "MM_MATERIAL_GROUP_MARA_MATKL": responseBasicData1Dto.MM_MATERIAL_GROUP_MARA_MATKL,
                                                    "MM_OLD_MATERIAL_NUMBER_MARA_BISMT": responseBasicData1Dto.MM_OLD_MATERIAL_NUMBER_MARA_BISMT,
                                                    "MM_DIVISION_MARA_SPART": responseBasicData1Dto.MM_DIVISION_MARA_SPART,
                                                    "MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR": responseBasicData1Dto.MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR,
                                                    "MM_PRODUCT_ALLOCATION_MARA_KOSCH": responseBasicData1Dto.MM_PRODUCT_ALLOCATION_MARA_KOSCH,
                                                    "MM_PRODUCT_HIERARCHY_MARA_PRDHA": responseBasicData1Dto.MM_PRODUCT_HIERARCHY_MARA_PRDHA,
                                                    "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE": responseBasicData1Dto?.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE, //xPlantVal,
                                                    "MM_VALID_FROM_MARA_DATAB": responseBasicData1Dto.MM_VALID_FROM_MARA_DATAB,
                                                    "MM_ASSIGN_EFFECT_VALS_MARA_KZEFF": responseBasicData1Dto.MM_ASSIGN_EFFECT_VALS_MARA_KZEFF,
                                                    "MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA": responseBasicData1Dto.MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA,
                                                    "MM_INDUSTRY_SECTOR_MARA_MBRSH": responseBasicData1Dto.MM_INDUSTRY_SECTOR_MARA_MBRSH,
                                                    "MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG": responseBasicData1Dto.MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG
                                                },
                                                "shippingData": {
                                                    "MM_TRANSPORTATION_GROUP_MARA_TRAGR": responseBasicData1Dto?.MM_TRANSPORTATION_GROUP_MARA_TRAGR
                                                },
                                                "matAuthGroup": {
                                                    "MM_AUTHORIZATION_GROUP_MARA_BEGRU": responseBasicData1Dto.MM_AUTHORIZATION_GROUP_MARA_BEGRU
                                                },
                                                "dimensionsEans": {
                                                    "MM_GROSS_WEIGHT_MARA_BRGEW": responseBasicData1Dto.MM_GROSS_WEIGHT_MARA_BRGEW,
                                                    "MM_WEIGHT_UNIT_MARM_GEWEI": responseBasicData1Dto.MM_WEIGHT_UNIT_MARM_GEWEI,
                                                    "MM_NET_WEIGHT_MARA_NTGEW": responseBasicData1Dto.MM_NET_WEIGHT_MARA_NTGEW,
                                                    "MM_VOLUME_MARM_VOLUM": responseBasicData1Dto.MM_VOLUME_MARM_VOLUM,
                                                    "MM_VOLUME_UNIT_MARM_VOLEH": responseBasicData1Dto.MM_VOLUME_UNIT_MARM_VOLEH,
                                                    "MM_SIZE_DIMENSIONS_MARA_GROES": responseBasicData1Dto.MM_SIZE_DIMENSIONS_MARA_GROES,
                                                    "MM_EAN_UPC_MARA_EAN11": responseBasicData1Dto.MM_EAN_UPC_MARA_EAN11,
                                                    "MM_EAN_CATEGORY_MARA_NUMTP": responseBasicData1Dto.MM_EAN_CATEGORY_MARA_NUMTP
                                                },
                                                "packagingMatData": {
                                                    "MM_MATL_GRP_PACK_MATLS_MARA_MAGRV": responseBasicData1Dto.MM_MATL_GRP_PACK_MATLS_MARA_MAGRV,
                                                    "MM_REF_MAT_FOR_PCKG_MARA_RMATP": responseBasicData1Dto.MM_REF_MAT_FOR_PCKG_MARA_RMATP
                                                },
                                                "advTrackTrace": {
                                                    "MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE": responseBasicData1Dto.MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE,
                                                    "MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF": responseBasicData1Dto.MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF,
                                                    "MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT": responseBasicData1Dto.MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT,
                                                    "MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT": responseBasicData1Dto.MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT,
                                                    "MM_LAST_SYNCHRONIZED_MARA_DATS": responseBasicData1Dto.MM_LAST_SYNCHRONIZED_MARA_DATS
                                                }
                                            }
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/generalData/data`, basicData1Dto.generalData);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/shippingData/data`, basicData1Dto?.shippingData);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/matAuthGroup/data`, basicData1Dto.matAuthGroup);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/dimensionsEans/data`, basicData1Dto.dimensionsEans);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/packagingMatData/data`, basicData1Dto.packagingMatData);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/advTrackTrace/data`, basicData1Dto.advTrackTrace);
                                        }

                                        //Basic Data 2
                                        if (currentSystemDetails?.basicData2Dto) {
                                            responseBasicData2Dto = currentSystemDetails.basicData2Dto;
                                            basicData2Dto = {
                                                "otherData": {
                                                    "MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH": responseBasicData2Dto.MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH,
                                                    "MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT": responseBasicData2Dto.MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT,
                                                    "MM_IND_DESCRIPTION_MARA_NORMT": responseBasicData2Dto.MM_IND_DESCRIPTION_MARA_NORMT,
                                                    "MM_CAD_INDICATOR_MARA_CADKZ": responseBasicData2Dto.MM_CAD_INDICATOR_MARA_CADKZ,
                                                    "MM_BASIC_MATERIAL_MARA_WRKST": responseBasicData2Dto.MM_BASIC_MATERIAL_MARA_WRKST,
                                                    "MM_MEDIUM_MARA_MEDIUM": responseBasicData2Dto.MM_MEDIUM_MARA_MEDIUM
                                                },
                                                "environment": {
                                                    "MM_DG_INDICATOR_PROFILE_MARA_PROFL": responseBasicData2Dto.MM_DG_INDICATOR_PROFILE_MARA_PROFL,
                                                    "MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW": responseBasicData2Dto.MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW,
                                                    "MM_IN_BULK_LIQUID_MARA_ILOOS": responseBasicData2Dto.MM_IN_BULK_LIQUID_MARA_ILOOS,
                                                    "MM_HIGHLY_VISCOS_MARA_IHIVI": responseBasicData2Dto.MM_HIGHLY_VISCOS_MARA_IHIVI
                                                },
                                                "designDocAssigned": {
                                                    "MM_NO_LINK": responseBasicData2Dto.MM_NO_LINK
                                                },
                                                "designdrawing": {
                                                    "MM_DOCUMENT_MARA_ZEINR": responseBasicData2Dto.MM_DOCUMENT_MARA_ZEINR,
                                                    "MM_DOCUMENT_TYPE_MARA_ZEIAR": responseBasicData2Dto.MM_DOCUMENT_TYPE_MARA_ZEIAR,
                                                    "MM_DOCUMENT_VERSION_MARA_ZEIVR": responseBasicData2Dto.MM_DOCUMENT_VERSION_MARA_ZEIVR,
                                                    "MM_PAGE_NUMBER_MARA_BLATT": responseBasicData2Dto.MM_PAGE_NUMBER_MARA_BLATT,
                                                    "MM_DOC_CH_NO_MARA_AESZN": responseBasicData2Dto.MM_DOC_CH_NO_MARA_AESZN,
                                                    "MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO": responseBasicData2Dto.MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO,
                                                    "MM_NO_SHEETS_MARA_BLANZ": responseBasicData2Dto.MM_NO_SHEETS_MARA_BLANZ
                                                },
                                                "clientSpecificConfig": {
                                                    "MM_CROSS_PLANT_CM_MARA_SATNR": responseBasicData2Dto.MM_CROSS_PLANT_CM_MARA_SATNR,
                                                    "MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG": responseBasicData2Dto.MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG,
                                                    "MM_VARIANT": responseBasicData2Dto.MM_VARIANT
                                                }

                                            }
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/otherData/data`, basicData2Dto.otherData);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/environment/data`, basicData2Dto.environment);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/designDocAssigned/data`, basicData2Dto.designDocAssigned);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/designdrawing/data`, basicData2Dto.designdrawing);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/clientSpecificConfig/data`, basicData2Dto.clientSpecificConfig);
                                        }

                                        let systemDetailsSelectedSystem = MaterialDetails.getProperty("/SystemData/targetSystem");

                                        //Additional Data- Description
                                        if (currentSystemDetails?.additionalDataDescDtos) {
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/AdditionalData/descriptionData/data`, currentSystemDetails?.additionalDataDescDtos);
                                            if (systemDetailsSelectedSystem == currentSystemId) {
                                                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/data", currentSystemDetails?.additionalDataDescDtos);
                                            }
                                        }

                                        //Additional Data - Basic Text
                                        if (currentSystemDetails?.additionalDataBasicDataTextDtos) {
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/AdditionalData/basicDataText/data`, currentSystemDetails?.additionalDataBasicDataTextDtos);
                                            if (systemDetailsSelectedSystem == currentSystemId) {
                                                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/data", currentSystemDetails?.additionalDataBasicDataTextDtos);
                                            }
                                        }

                                        // Classification Data 
                                        if (currentSystemDetails?.classificationData) {
                                            let systemDetailsSelectedSystem = MaterialDetails.getProperty("/SystemData/targetSystem"),
                                                isEditPerformed = false,
                                                isNewAddedClass = false,
                                                editSelectedClassNum = null,
                                                classList = [],
                                                classDependentFields = {},
                                                ClassificationClass = LookupModel.getProperty(`/classificationClassList/${currentSystemId}/ClassificationClass`),
                                                // ClassificationClass = LookupModel.getProperty("/ClassificationClass"),
                                                responseDataClassification = currentSystemDetails?.classificationData;
                                            responseDataClassification?.map(function (listItem) {
                                                let classListobj = {
                                                    "classnum": listItem?.classnum,
                                                    "newlyAdded": listItem?.newlyAdded,
                                                    "isEdited": listItem?.isEdited,
                                                    "Descrption": null,
                                                    "classificationListId": listItem?.classificationListId
                                                };
                                                if (listItem?.isEdited == true) {
                                                    isEditPerformed = true;
                                                    editSelectedClassNum = listItem?.classnum;
                                                }
                                                if (listItem?.newlyAdded == true) {
                                                    isNewAddedClass = true;
                                                }
                                                classDependentFields[listItem?.classnum] = { "toClassificationItem": null };
                                                classDependentFields[listItem?.classnum]["toClassificationItem"] = listItem?.toClassificationItem;
                                                let mappedObj = ClassificationClass?.find(obj =>
                                                    obj.classnum == listItem?.classnum
                                                );
                                                classListobj.Descrption = mappedObj?.Descrption;
                                                classList.push(classListobj);
                                            })
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/editClassification/isNewAddedClass`, isNewAddedClass);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/editClassification/isEditPerformed`, isEditPerformed);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/editClassification/editSelectedClassNum`, editSelectedClassNum);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classList`, classList);
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classDependentFields`, classDependentFields);
                                            if (systemDetailsSelectedSystem == currentSystemId) {
                                                MaterialDetails.setProperty("/SystemDetails/Classification/classList", classList);
                                                MaterialDetails.setProperty("/SystemDetails/Classification/classDependentFields", classDependentFields);
                                            }
                                        }

                                        //Additional Uom
                                        if (currentSystemDetails?.additionalUomDto) {
                                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/AdditionalUOM/UOMData`, currentSystemDetails?.additionalUomDto);
                                        }
                                    }
                                }
                                MaterialDetails.setProperty("/SystemData/selectedSystems", responseData.systemData)
                            }

                            if (responseData?.organizationalDataDtos) {
                                orgData = responseData.organizationalDataDtos;
                            }
                            MaterialDetails.setProperty("/OrganizationalData/selectedPlants", orgData);

                            if (responseData?.materialRequestChangeLogDtos) {
                                materialRequestLogDto = responseData?.materialRequestChangeLogDtos
                            }
                            MaterialDetails.setProperty("/materialChangeHistory/requestLog", materialRequestLogDto);

                            if (responseData?.requestESignDtoList) {
                                eSignLogDto = responseData?.requestESignDtoList
                            }
                            MaterialDetails.setProperty("/materialChangeHistory/eSignLog", eSignLogDto);
                            resolve(true);
                        },
                        function (responseData) {
                            resolve(true);
                        }
                    );
                    // if(!isUserRequestOwner && viewName === "CreateProject" && wfTaskType === "Request_Form_Submission"){
                    //     that.fnMakeSystemTabButtonsInvisible();
                    // }
                });
            },

            fnCreateClassificationItemDesc: function (classificationItem) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    classificationDesc = {};
                for (let key in classificationItem) {
                    let lookupPath = "/" + key,
                        lookupData = LookupModel.getProperty(lookupPath);
                    if (lookupData) {
                        classificationDesc[key] = lookupData.find(item => item.CharValue === classificationItem[key])?.DescrCval || classificationItem[key];
                    } else {
                        classificationDesc[key] = classificationItem[key];
                    }
                }
                return classificationDesc;
            },

            fnFrameMaterialDetailsOldNewDto: function (frameDtoFor) {
                let that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    Repository = this.getModelDetails("Repository"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    materialData = MaterialDetails.getData(),
                    productData = materialData?.ProductData,
                    productDataStatic = materialData?.ProductDataStatic,
                    orgData = materialData?.OrganizationalData?.selectedPlants,
                    systemData = materialData?.SystemData,
                    selectedSystems = systemData.selectedSystems,
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    currentDate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                    currentUser = this.fnGetCurrentUserMailID(),
                    wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                    taskId = this.fnGetWfDetailsModelData("taskId"),
                    refMaterialNumber = MaterialDetails.getProperty("/GeneralData/refMaterialNumber"),
                    oDataLookupsList = LookupModel.getProperty("/oDataLookups"),
                    dataChangeIndicatorDto = {},
                    oldMaterialListDetailsDto = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData"),
                    isOldDataFromExistingMaterial = oldMaterialListDetailsDto?.isOldDataFromExistingMaterial || false,
                    savedRefMaterialNumber = oldMaterialListDetailsDto.refMaterialNumber,
                    selectedPath = CreateProject.getProperty("/MaterialList/selectedPath"),
                    Selectedindex = selectedPath?.slice(selectedPath.lastIndexOf('/') + 1),
                    repositoryStatusId = CreateProject.getProperty(`/MaterialList/materialList/${Selectedindex}/repositoryStatusId`),
                    viewName = this.getViewName(),
                    requestSource = this.getRequestSource(),
                    updatedMaterialListDetailsDto = {},
                    oldMaterialListDetailsDtoTemplate = {},
                    matDetailsPayload = {},
                    productDataDto = {},
                    productDataDescDto = {},
                    productDataDescDtoOld = {},
                    productDataStaticDto = {},
                    productDataStaticDescDto = {},
                    productDataStaticDescDtoOld = {},
                    organizationalDataDtos = [],
                    basicData1DtoDataDesc = {},
                    basicData2DtoDataDesc = {},
                    classficationDataDesc = {},
                    targetSystemDto = {},
                    systemDataDto = [],
                    alternateID = [],
                    alternateIdDesc = [],
                    alternateIdDescOld = [], matListData,
                    id_MS_Commited_To_Repo_NotSyndicated = 10,
                    id_MS_Commited_To_Repo_SyndicatedError = 11,
                    id_MS_Not_Applicable = 13,
                    id_MS_Not_Selected = 15,
                    id_MS_Syndicated = 9,
                    id_MS_Draft = 1;
                if (requestSource === "Request_Management") {
                    matListData = CreateProject.getProperty("/MaterialList/selectedMaterialData");
                }
                else if (requestSource === "Repository") {
                    matListData = Repository.getProperty("/MaterialSelected");
                }
                oldMaterialListDetailsDtoTemplate = {
                    "productData": {},
                    "productDataDescDto": {},
                    "productDataStatic": {
                        "alternateIdDto": [],
                        "hierarchyData": null
                    },
                    "productDataStaticDesc": {
                        "alternateIdDto": [],
                        "hierarchyData": null
                    },
                    "organizationalDataDtos": [],
                    "systemData": [],
                    "esignDone": false,
                    "esignDtoList": [],
                    "basicDataSaved": false,
                    "included": null,
                    "markedAsDeleted": null,
                    "materialDesc": null,
                    "materialNumber": parseInt(matListData?.materialNumber) || null,
                    "refMaterialNumber": null,
                    "materialStatusId": 1,
                    "isValidated": null,
                    "materialTypeId": parseInt(matListData?.materialTypeId),
                    "materialTypeDesc": null,
                    "materialListId": parseInt(matListData?.materialListId) || null,
                    "requestNumber": parseInt(requestNumber),
                    "createdOn": oldMaterialListDetailsDto?.createdOn || null,
                    "createdBy": oldMaterialListDetailsDto?.createdBy || null,
                    "changedOn": oldMaterialListDetailsDto?.changedOn || null,
                    "changedBy": oldMaterialListDetailsDto?.changedBy || null,
                    "targetSystem": {}
                };
                if (productData) {
                    for (let className in productData) {
                        let classDetails = productData[className],
                            data = classDetails?.data || {};
                        productDataDescDto[className] = this.fnFrameProductDataDescDto(productData, className, data);
                        //For MultiComboBox, Backend accepts only string values but we store it in array in UI
                        for (let field in data) {
                            let fieldTypePath = "/productDataOutline/" + className + "/MM_UI_FIELD_TYPE/" + field,
                                fieldTypePathRepo = "/ProductData/productDataOutline/" + className + "/MM_UI_FIELD_TYPE/" + field,
                                fieldType = null,
                                fullClassName = "/ProductData/" + className + "/data/" + field;
                            if (viewName === "Repository") {
                                fieldType = Repository.getProperty(fieldTypePathRepo);
                            }
                            else {
                                fieldType = CreateProject.getProperty(fieldTypePath);
                            }
                            if (fieldType === "MultiComboBox") {
                                data[field] = this.arrayToString(data[field]);
                            }
                            if (fieldType === "Tree") {
                                data[field] = MaterialDetails.getProperty(fullClassName);
                            }
                        }
                        productDataDto[className] = data;
                    }
                }

                if (productDataStatic) {
                    if (alternateID) {
                        let data = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedIDs"),
                            alternateIdRefList = LookupModel.getProperty("/MM_ALTERNATE_ID_TYPE_REF_LIST"),
                            alternateIdTypeCountryRefList = LookupModel.getProperty("/MM_COUNTRY_REF_LIST"),
                            fieldValueRefList = LookupModel.getProperty("/MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST");
                        data.map(function (item) {
                            let alternateTypeIdDesc = formatter.getAlternateIdTypeText(item.Alternate_ID_Type, alternateIdRefList),
                                alternateIdTypeCountryCode = formatter.getAlternateIdTypeCountryCode(item.Alternate_ID_Type_Country, alternateIdTypeCountryRefList),
                                fieldValueDesc = formatter.getAlternateIdFieldText(item.Field_Value, fieldValueRefList),
                                lineAlternateId = {
                                    "MM_ALTERNATE_ID_TYPE_COUNTRY": parseInt(item.Alternate_ID_Type_Country),
                                    "MM_ALTERNATE_ID_TYPE": parseInt(item.Alternate_ID_Type),
                                    "MM_ALTERNATE_ID_FIELD_VALUE": item.Field_Value,
                                    "materialListId": parseInt(matListData?.materialListId),
                                    "MM_ALTERNATE_ID_REQUEST_ROW_ID": item.Request_Row_Id ? parseInt(item.Request_Row_Id) : null,
                                    "isDeleted": item.isDeleted ? item.isDeleted : false,
                                    "isModified": item.isModified ? item.isModified : false,
                                    "MM_ALTERNATE_ID_REPOSITORY_ROW_ID": item.Repository_Row_ID ? parseInt(item.Repository_Row_ID) : null,
                                    "materialNumber": parseInt(matListData?.materialNumber),
                                    "MM_NEWLY_ADDED": item.MM_NEWLY_ADDED == false ? false : true,
                                    "isActive": item.isActive || false
                                }
                            alternateID.push(lineAlternateId);
                            //Adding descriptions for alternate ID Data
                            let lineAlternateIdDesc = {
                                "MM_ALTERNATE_ID_REQUEST_ROW_ID": item.Request_Row_Id ? parseInt(item.Request_Row_Id) : null,
                                "MM_ALTERNATE_ID_TYPE_COUNTRY": alternateIdTypeCountryCode,
                                "MM_ALTERNATE_ID_TYPE": alternateTypeIdDesc,
                                "MM_ALTERNATE_ID_FIELD_VALUE": fieldValueDesc,
                                "MM_ALTERNATE_ID_REPOSITORY_ROW_ID": item.Repository_Row_ID ? parseInt(item.Repository_Row_ID) : null,
                                "materialNumber": parseInt(matListData?.materialNumber),
                                "isActive": item.isActive || false
                            }
                            alternateIdDesc.push(lineAlternateIdDesc)
                        })
                        productDataStaticDto.alternateIdDto = alternateID;
                        productDataStaticDescDto.alternateIdDto = alternateIdDesc;
                    }
                    productDataStatic.hierarchyData = null;
                    productDataStaticDescDto.hierarchyData = null;
                }

                if (orgData) {
                    orgData.map(function (OrgRefObj) {
                        let plantRefList = LookupModel.getProperty("/MM_PLANT_REF_LIST"),
                            materialStatusRefList = LookupModel.getProperty("/materialStatus"),
                            plantActiveStatus = plantRefList.find(obj => obj.MM_KEY == OrgRefObj.MM_PLANT_ID)?.MM_PLANT_ACTIVE || OrgRefObj.plantActive,
                            plantDesc = formatter.getPlantDescText(OrgRefObj.MM_PLANT_ID, plantRefList);

                        if (requestSource === "Repository") {
                            let repoSubmitFor = Repository.getProperty("/MaterialSelected/repoSubmitFor");
                            if (repoSubmitFor === "Modify") {
                                OrgRefObj.requestPlantStatus = id_MS_Not_Applicable;
                            }
                            else if (repoSubmitFor === "Extend") {
                                if (OrgRefObj.isIncluded) {
                                    OrgRefObj.requestPlantStatus = id_MS_Draft;
                                }
                                else {
                                    OrgRefObj.requestPlantStatus = id_MS_Not_Selected;
                                }
                            }
                        }

                        let plantStatusDesc = formatter.getMaterialStatusText(OrgRefObj.requestPlantStatus, materialStatusRefList),
                            orgDataRef = {
                                "isModified": false,
                                "newlyAdded": false,
                                "batchManagement": OrgRefObj.batchManagement || false,
                                "costing": OrgRefObj.costing || null,
                                "isIncluded": OrgRefObj.isIncluded,
                                "isSapSyndicated": OrgRefObj.isSapSyndicated,
                                "plantActive": parseInt(plantActiveStatus) || null,
                                "MM_PLANT_ID": parseInt(OrgRefObj.MM_PLANT_ID),
                                "plantCode": formatter.getPlantIdCode(OrgRefObj.MM_PLANT_ID, plantRefList),
                                "plantDesc": plantDesc,
                                "profitCenterId": OrgRefObj.profitCenterId || null,
                                "salesOrg": OrgRefObj.salesOrg || null,
                                "systemId": OrgRefObj.systemId || null,
                                "wareHouse": OrgRefObj.wareHouse || null,
                                "serializationValidFrom": OrgRefObj.serializationValidFrom || null,
                                "materialListId": matListData?.materialListId,
                                "materialNumber": matListData?.materialNumber || 0,
                                "requestNumber": requestNumber,
                                "requestPlantStatus": OrgRefObj.requestPlantStatus || 1, // By default, set the Plant Status to Draft or send the status as per the Service Data
                                "repositoryPlantStatusId": OrgRefObj.repositoryPlantStatusId,
                                "plantStatusDesc": plantStatusDesc,
                                "plantSpecificMatStatus": OrgRefObj.plantSpecificMatStatus,
                                "plantSpecificMatStatusDesc": formatter.getPlantSpecificMatStatusText(OrgRefObj.plantSpecificMatStatus, OrgRefObj.systemId, oDataLookupsList)
                            };
                        organizationalDataDtos.push(orgDataRef);
                    });
                }

                if (systemData) {
                    for (let targetSystem in selectedSystems) {
                        var systemId = selectedSystems[targetSystem].MM_SYSTEM_ID,
                            isIncluded = selectedSystems[targetSystem].isIncluded,
                            materialNumber = selectedSystems[targetSystem].materialNumber,
                            targetSystemMaterialNumber = selectedSystems[targetSystem].MM_TARGET_SYSTEM_MATERIAL_ID,
                            requestSystemStatusId = selectedSystems[targetSystem].requestSystemStatusId || 1,
                            repositorySystemStatusId = selectedSystems[targetSystem].repositorySystemStatusId,
                            taskName = selectedSystems[targetSystem].taskName || wfTaskType,
                            taskInstanceId = selectedSystems[targetSystem].taskInstanceId || taskId,
                            targetSystemMaterialType = selectedSystems[targetSystem].MM_TARGET_SYSTEM_MATERIAL_TYPE_ID,
                            markForSyndication = selectedSystems[targetSystem].markForSyndication,
                            systemDetails = this.fnFrameTargetSystemData(systemId);
                        targetSystemDto[systemId] = systemDetails;

                        if (requestSource === "Repository") {
                            requestSystemStatusId = selectedSystems[targetSystem]?.repositorySystemStatusId;
                            let repoSubmitFor = Repository.getProperty("/MaterialSelected/repoSubmitFor"),
                                reposSystemStatusID = selectedSystems[targetSystem]?.repositorySystemStatusId;
                            if (repoSubmitFor === "Modify") {
                                requestSystemStatusId = id_MS_Draft;
                            }
                            else if (repoSubmitFor === "Extend") {
                                if (reposSystemStatusID == id_MS_Syndicated) {
                                    requestSystemStatusId = id_MS_Not_Applicable;
                                } else {
                                    requestSystemStatusId = id_MS_Draft;
                                }
                            }
                        }

                        let obj = {
                            "materialListId": 0,
                            "isIncluded": isIncluded,
                            "materialNumber": materialNumber,
                            "markForSyndication": markForSyndication,
                            "syndicationStatus": 0,
                            "MM_SYSTEM_ID": parseInt(systemId),
                            "MM_TARGET_SYSTEM_MATERIAL_ID": targetSystemMaterialNumber || null,
                            "MM_TARGET_SYSTEM_MATERIAL_TYPE_ID": targetSystemMaterialType || null,
                            "requestSystemStatusId": requestSystemStatusId || 1,
                            "repositorySystemStatusId": repositorySystemStatusId,
                            "taskInstanceId": taskInstanceId,
                            "taskName": taskName
                        }
                        systemDataDto.push(obj);
                    }
                }

                updatedMaterialListDetailsDto = {
                    "included": true,
                    "materialDesc": null,
                    "materialNumber": parseInt(matListData?.materialNumber) || null,
                    "materialStatusId": matListData?.materialStatusId || 1, //Very First Save - status ID - 1 ( Draft ), orelse pass the same status as from Java Service
                    "validated": frameDtoFor === "Save" ? false : true,
                    "materialTypeId": parseInt(matListData?.materialTypeId) || null,
                    "materialTypeDesc": null,
                    "refMaterialNumber": parseInt(refMaterialNumber) || parseInt(savedRefMaterialNumber),
                    "repositoryStatusId": repositoryStatusId || null,
                    "materialListId": matListData?.materialListId || null,
                    "requestNumber": requestNumber,
                    "createdOn": oldMaterialListDetailsDto?.createdOn ? oldMaterialListDetailsDto?.createdOn : currentDate,
                    "createdBy": oldMaterialListDetailsDto?.createdBy ? oldMaterialListDetailsDto?.createdBy : currentUser,
                    "changedOn": currentDate,
                    "changedBy": currentUser,
                    "productData": productDataDto,
                    "productDataDescDto": productDataDescDto,
                    "productDataStatic": productDataStaticDto,
                    "productDataStaticDesc": productDataStaticDescDto,
                    "organizationalDataDtos": organizationalDataDtos,
                    "systemData": systemDataDto,
                    "targetSystem": targetSystemDto
                }

                if (oldMaterialListDetailsDto === null || oldMaterialListDetailsDto === undefined || (Object.keys(oldMaterialListDetailsDto).length === 0 && oldMaterialListDetailsDto.constructor === Object)) {
                    oldMaterialListDetailsDto = oldMaterialListDetailsDtoTemplate;
                }
                else {
                    if (isOldDataFromExistingMaterial) {
                        delete oldMaterialListDetailsDto.isOldDataFromExistingMaterial;
                        oldMaterialListDetailsDto = { ...oldMaterialListDetailsDtoTemplate, ...oldMaterialListDetailsDto };
                    }
                    for (let className in productData) {
                        let data = oldMaterialListDetailsDto.productData[className];
                        productDataDescDtoOld[className] = this.fnFrameProductDataDescDto(productData, className, data);
                    }
                    productDataDescDto = productDataDescDtoOld
                    oldMaterialListDetailsDto = { ...oldMaterialListDetailsDto, productDataDescDto }

                    let oldSystemData = oldMaterialListDetailsDto?.systemData
                    if (oldMaterialListDetailsDto?.systemData) {
                        for (let targetSystem of oldSystemData) {
                            var systemId = targetSystem.MM_SYSTEM_ID;
                            basicData1DtoDataDesc = this.fnFrameBasicDataDescDto(oldMaterialListDetailsDto.targetSystem[JSON.stringify(systemId)]?.basicData1Dto, "BasicData1", systemId);
                            oldMaterialListDetailsDto.targetSystem[systemId] = { ...oldMaterialListDetailsDto.targetSystem[systemId], basicData1DtoDataDesc };

                            basicData2DtoDataDesc = this.fnFrameBasicDataDescDto(oldMaterialListDetailsDto.targetSystem[JSON.stringify(systemId)]?.basicData2Dto, "BasicData2", systemId);
                            oldMaterialListDetailsDto.targetSystem[systemId] = { ...oldMaterialListDetailsDto.targetSystem[systemId], basicData2DtoDataDesc };

                            (oldMaterialListDetailsDto?.targetSystem[JSON.stringify(systemId)]?.classificationData)?.map((item, index) => {
                                let toClassificationItem = item?.toClassificationItem,
                                    classficationItemDesc = that.fnCreateClassificationItemDesc(toClassificationItem);
                                oldMaterialListDetailsDto.targetSystem[JSON.stringify(systemId)].classificationData[index].toClassificationItemDesc = classficationItemDesc;
                            })
                        }
                    }

                    // Adding plant Desc and profit center Desc into old plant data
                    let oldOrgData = oldMaterialListDetailsDto.organizationalDataDtos
                    if (oldOrgData) {
                        oldOrgData.map(function (OrgRefObj) {
                            let plantRefList = LookupModel.getProperty("/MM_PLANT_REF_LIST"),
                                materialStatusRefList = LookupModel.getProperty("/materialStatus"),
                                plantDesc = formatter.getPlantDescText(OrgRefObj.MM_PLANT_ID, plantRefList),
                                plantStatusDesc = formatter.getMaterialStatusText(OrgRefObj.plantStatus, materialStatusRefList);
                            OrgRefObj.plantDesc = plantDesc;
                            OrgRefObj.plantStatusDesc = plantStatusDesc;
                            OrgRefObj.plantSpecificMatStatusDesc = formatter.getPlantSpecificMatStatusText(OrgRefObj.plantSpecificMatStatus, OrgRefObj.systemId, oDataLookupsList)
                        });
                    }

                    //Adding Alternate ID Descriptions into old Alternate ID Data
                    if (oldMaterialListDetailsDto?.productDataStatic?.alternateIdDto) {
                        if (alternateIdDescOld) {
                            let data = oldMaterialListDetailsDto?.productDataStatic?.alternateIdDto,
                                alternateIdRefList = LookupModel.getProperty("/MM_ALTERNATE_ID_TYPE_REF_LIST"),
                                alternateIdTypeCountryRefList = LookupModel.getProperty("/MM_COUNTRY_REF_LIST"),
                                fieldValueRefList = LookupModel.getProperty("/MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST");
                            data.map(function (item) {
                                //Adding descriptions for alternate ID Data
                                let alternateTypeIdDesc = formatter.getAlternateIdTypeText(item.MM_ALTERNATE_ID_TYPE, alternateIdRefList),
                                    alternateIdTypeCountryCode = formatter.getAlternateIdTypeCountryCode(item.MM_ALTERNATE_ID_TYPE_COUNTRY, alternateIdTypeCountryRefList),
                                    fieldValueDesc = formatter.getAlternateIdFieldText(item.MM_ALTERNATE_ID_FIELD_VALUE, fieldValueRefList),
                                    lineAlternateIdDescOld = {
                                        "MM_ALTERNATE_ID_REQUEST_ROW_ID": item.MM_ALTERNATE_ID_REQUEST_ROW_ID ? parseInt(item.MM_ALTERNATE_ID_REQUEST_ROW_ID) : null,
                                        "MM_ALTERNATE_ID_TYPE_COUNTRY": alternateIdTypeCountryCode,
                                        "MM_ALTERNATE_ID_TYPE": alternateTypeIdDesc,
                                        "MM_ALTERNATE_ID_FIELD_VALUE": fieldValueDesc,
                                        "MM_ALTERNATE_ID_REPOSITORY_ROW_ID": item.MM_ALTERNATE_ID_REPOSITORY_ROW_ID ? parseInt(item.MM_ALTERNATE_ID_REPOSITORY_ROW_ID) : null,
                                        "materialNumber": parseInt(matListData?.materialNumber) || null,
                                        "isActive": item.isActive || false
                                    }
                                alternateIdDescOld.push(lineAlternateIdDescOld)
                            })
                            productDataStaticDescDtoOld.alternateIdDto = alternateIdDescOld;
                            oldMaterialListDetailsDto.productDataStaticDesc = productDataStaticDescDtoOld;
                        }
                        oldMaterialListDetailsDto.productDataStaticDesc.hierarchyData = null;
                    }
                }

                dataChangeIndicatorDto = {
                    "additionalDataBasicDataTextChangeFlag": true,
                    "additionalDataDescChangeFlag": true,
                    "additionalUomDataChangeFlag": true,
                    "basicData1changeFlag": true,
                    "basicData2changeFlag": true,
                    "classificationDataChangeFlag": true,
                    "isSyndicated": true,
                    "materialNoGenerationReq": (frameDtoFor === "Validate" && wfTaskType == "GMDM_WF_Task" && !matListData?.materialNumber && viewName != "Repository") ? true : false, // If Material No doesn't exist, generate no only if it's Validated in GMDM Task
                    "organisationDataFlag": true,
                    "productDataChangeFlag": true
                };

                matDetailsPayload = {
                    "dataChangeIndicatorDto": dataChangeIndicatorDto,
                    "updatedMaterialListDetailsDto": updatedMaterialListDetailsDto,
                    "oldMaterialListDetailsDto": oldMaterialListDetailsDto
                }
                return matDetailsPayload;
            },

            fnFrameTargetSystemData: function (systemId) {
                var that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    matListData = CreateProject.getProperty("/MaterialList/selectedMaterialData"),
                    currentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}`),
                    basicData1 = currentSystemDetails?.basicData1,
                    basicData2 = currentSystemDetails?.basicData2,
                    altUomData = currentSystemDetails?.AdditionalUOM?.UOMData,
                    classificationData = currentSystemDetails?.Classification,
                    additionalDataDesc = currentSystemDetails?.AdditionalData?.descriptionData?.data,
                    additionalDataBasicText = currentSystemDetails?.AdditionalData?.basicDataText?.data,
                    basicData1Dto = {},
                    basicData2Dto = {},
                    basicData1DtoDataDesc = {}, basicData2DtoDataDesc = {},
                    altUomsDto = [],
                    classificationDto = {},
                    systemDetails = {};

                if (basicData1 && (!(basicData1 && Object.keys(basicData1).length === 0))) {
                    var generalData = basicData1.generalData.data,
                        matAuthGroup = basicData1.matAuthGroup.data,
                        dimensionsEans = basicData1.dimensionsEans.data,
                        packagingMatData = basicData1.packagingMatData.data,
                        shippingData = basicData1.shippingData.data,
                        advTrackTrace = basicData1.advTrackTrace.data;
                    // x plant is set to "" if it is "BLANK" added condition above
                    // if (generalData.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE == "BLANK") {
                    //     generalData.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = "";
                    // }

                    basicData1Dto = {
                        "MM_ASSIGN_EFFECT_VALS_MARA_KZEFF": generalData.MM_ASSIGN_EFFECT_VALS_MARA_KZEFF || false,
                        "MM_AUTHORIZATION_GROUP_MARA_BEGRU": matAuthGroup.MM_AUTHORIZATION_GROUP_MARA_BEGRU || null,
                        "MM_DIVISION_MARA_SPART": generalData.MM_DIVISION_MARA_SPART || null,
                        "MM_EAN_UPC_MARA_EAN11": dimensionsEans.MM_EAN_UPC_MARA_EAN11 || null,
                        "MM_EAN_CATEGORY_MARA_NUMTP": dimensionsEans.MM_EAN_CATEGORY_MARA_NUMTP || null,
                        "MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA": generalData.MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA || null,
                        "MM_TRANSPORTATION_GROUP_MARA_TRAGR": shippingData?.MM_TRANSPORTATION_GROUP_MARA_TRAGR || null,
                        "MM_GROSS_WEIGHT_MARA_BRGEW": dimensionsEans.MM_GROSS_WEIGHT_MARA_BRGEW || null,
                        "MM_INDUSTRY_SECTOR_MARA_MBRSH": generalData.MM_INDUSTRY_SECTOR_MARA_MBRSH || null,
                        "MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR": generalData.MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR || null,
                        "MM_LAST_SYNCHRONIZED_MARA_DATS": advTrackTrace.MM_LAST_SYNCHRONIZED_MARA_DATS || null,
                        "MM_MATERIAL_GROUP_MARA_MATKL": generalData.MM_MATERIAL_GROUP_MARA_MATKL || null,
                        "MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG": generalData.MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG || null,
                        "MM_MATL_GRP_PACK_MATLS_MARA_MAGRV": packagingMatData.MM_MATL_GRP_PACK_MATLS_MARA_MAGRV || null,
                        "materialListId": parseInt(matListData.materialListId) || null,
                        "MM_NET_WEIGHT_MARA_NTGEW": dimensionsEans.MM_NET_WEIGHT_MARA_NTGEW || null,
                        "MM_OLD_MATERIAL_NUMBER_MARA_BISMT": generalData.MM_OLD_MATERIAL_NUMBER_MARA_BISMT || null,
                        "MM_PRODUCT_ALLOCATION_MARA_KOSCH": generalData.MM_PRODUCT_ALLOCATION_MARA_KOSCH || null,
                        "MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT": advTrackTrace.MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT || null,
                        "MM_PRODUCT_HIERARCHY_MARA_PRDHA": generalData.MM_PRODUCT_HIERARCHY_MARA_PRDHA || null,
                        "MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF": advTrackTrace.MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF || null,
                        "MM_REF_MAT_FOR_PCKG_MARA_RMATP": packagingMatData.MM_REF_MAT_FOR_PCKG_MARA_RMATP || null,
                        "MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE": parseInt(advTrackTrace.MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE),
                        "MM_SIZE_DIMENSIONS_MARA_GROES": dimensionsEans.MM_SIZE_DIMENSIONS_MARA_GROES || null,
                        "MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT": advTrackTrace.MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT || false,
                        "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS": generalData.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS || null,
                        "MM_VALID_FROM_MARA_DATAB": generalData.MM_VALID_FROM_MARA_DATAB || null,
                        "MM_VOLUME_MARM_VOLUM": dimensionsEans.MM_VOLUME_MARM_VOLUM || null,
                        "MM_VOLUME_UNIT_MARM_VOLEH": dimensionsEans.MM_VOLUME_UNIT_MARM_VOLEH || null,
                        "MM_WEIGHT_UNIT_MARM_GEWEI": dimensionsEans.MM_WEIGHT_UNIT_MARM_GEWEI || null,
                        "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE": generalData.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE,
                    }
                    basicData1DtoDataDesc = this.fnFrameBasicDataDescDto(basicData1Dto, "BasicData1", systemId);
                    systemDetails.basicData1Dto = basicData1Dto;
                    systemDetails.basicData1DtoDataDesc = basicData1DtoDataDesc;
                }
                else {
                    systemDetails.basicData1Dto = {};
                    systemDetails.basicData1DtoDataDesc = {};
                }


                if (basicData2 && (!(Object.keys(basicData2).length === 0))) {
                    var otherData = basicData2.otherData.data,
                        environment = basicData2.environment.data,
                        designDocAssigned = basicData2.designDocAssigned.data,
                        designdrawing = basicData2.designdrawing.data,
                        clientSpecificConfig = basicData2.clientSpecificConfig.data;

                    basicData2Dto = {
                        "MM_BASIC_MATERIAL_MARA_WRKST": otherData.MM_BASIC_MATERIAL_MARA_WRKST || null,
                        "MM_CAD_INDICATOR_MARA_CADKZ": otherData.MM_CAD_INDICATOR_MARA_CADKZ || false,
                        // "configureVariant": otherData.MM_BASIC_MATERIAL_MARA_WRKST || null,
                        "MM_CROSS_PLANT_CM_MARA_SATNR": clientSpecificConfig.MM_CROSS_PLANT_CM_MARA_SATNR || null,
                        "MM_DG_INDICATOR_PROFILE_MARA_PROFL": environment.MM_DG_INDICATOR_PROFILE_MARA_PROFL || null,
                        "MM_DOC_CH_NO_MARA_AESZN": designdrawing.MM_DOC_CH_NO_MARA_AESZN || null,
                        "MM_DOCUMENT_VERSION_MARA_ZEIVR": designdrawing.MM_DOCUMENT_VERSION_MARA_ZEIVR || null,
                        "MM_DOCUMENT_MARA_ZEINR": designdrawing.MM_DOCUMENT_MARA_ZEINR || null,
                        "MM_DOCUMENT_TYPE_MARA_ZEIAR": designdrawing.MM_DOCUMENT_TYPE_MARA_ZEIAR || null,
                        "MM_IN_BULK_LIQUID_MARA_ILOOS": environment.MM_IN_BULK_LIQUID_MARA_ILOOS || false,
                        "MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW": environment.MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW || false,
                        "MM_HIGHLY_VISCOS_MARA_IHIVI": environment.MM_HIGHLY_VISCOS_MARA_IHIVI || false,
                        "MM_IND_DESCRIPTION_MARA_NORMT": otherData.MM_IND_DESCRIPTION_MARA_NORMT || null,
                        "MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG": clientSpecificConfig.MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG || false,
                        "materialListId": parseInt(matListData.materialListId) || null,
                        "MM_MEDIUM_MARA_MEDIUM": otherData.MM_MEDIUM_MARA_MEDIUM || null,
                        "MM_NO_LINK": designDocAssigned.MM_NO_LINK || false,
                        "MM_NO_SHEETS_MARA_BLANZ": designdrawing.MM_NO_SHEETS_MARA_BLANZ || null,
                        "MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO": designdrawing.MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO || null,
                        "MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT": otherData.MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT || null,
                        "MM_PAGE_NUMBER_MARA_BLATT": designdrawing.MM_PAGE_NUMBER_MARA_BLATT || null,
                        "MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH": otherData.MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH || null,
                        "MM_VARIANT": clientSpecificConfig.MM_VARIANT || false
                    };
                    basicData2DtoDataDesc = this.fnFrameBasicDataDescDto(basicData2Dto, "BasicData2", systemId);
                    systemDetails.basicData2Dto = basicData2Dto;
                    systemDetails.basicData2DtoDataDesc = basicData2DtoDataDesc;
                }
                else {
                    systemDetails.basicData2Dto = {};
                    systemDetails.basicData2DtoDataDesc = {};
                }

                if (altUomData) {
                    altUomsDto = this.fnFrameAltUomPayload(altUomData, matListData?.materialListId);
                    systemDetails.additionalUomDto = altUomsDto;
                }

                //Additional Tab - Description Tab
                if (additionalDataDesc) {
                    for (var i = 0; i < additionalDataDesc.length; i++) {
                        additionalDataDesc[i].materialListId = matListData.materialListId;
                        additionalDataDesc[i].MM_NEWLY_ADDED = additionalDataDesc[i].MM_NEWLY_ADDED == false ? false : true;
                    }
                    systemDetails.additionalDataDescDtos = additionalDataDesc;
                }

                //Additional Tab - Basic Text Tab
                if (additionalDataBasicText) {
                    for (var i = 0; i < additionalDataBasicText.length; i++) {
                        additionalDataBasicText[i].materialListId = matListData.materialListId;
                        additionalDataBasicText[i].MM_NEWLY_ADDED = additionalDataBasicText[i].MM_NEWLY_ADDED == false ? false : true;
                    }
                    systemDetails.additionalDataBasicDataTextDtos = additionalDataBasicText;
                }

                // Classification Tab
                if (classificationData) {
                    classificationDto = this._fnCreateClassificationPayload(systemId);
                    classificationDto?.map((item, index) => {
                        let toClassificationItem = item?.toClassificationItem,
                            classficationItemDesc = that.fnCreateClassificationItemDesc(toClassificationItem);
                        classificationDto[index].toClassificationItemDesc = classficationItemDesc;
                    })
                    systemDetails.classificationData = classificationDto
                }

                return systemDetails;
            },

            //Function to frame the Product Data and Basic Data 1,2 descriptions from Codes
            fnFrameProductDataDescDto: function (productData, className, data) {
                var that = this,
                    LookupModel = this.getModelDetails("LookupModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    classDetails = productData[className],
                    descData = {},
                    arrayData = [],
                    fieldType = classDetails?.MM_UI_FIELD_TYPE || {};

                for (let field in data) {
                    let fieldDataType = fieldType[field],
                        fieldPath = "/" + field,
                        lookupData = LookupModel.getProperty(fieldPath),
                        ruleNameList = classDetails?.MM_LOOKUP_RULE_NAME || {},
                        fieldRuleName = ruleNameList[field] || null;
                    if ((fieldDataType === "InputSearch" || fieldDataType === "Dropdown") && lookupData && data[field]) {
                        let codePath = "MM_KEY",
                            descPath = `${fieldRuleName}_DESC`,
                            mappedLookupObj = null, mappedDescValue = null;
                        mappedLookupObj = lookupData.find(obj =>
                            obj[codePath] == data[field]
                        );
                        if (mappedLookupObj) {
                            mappedDescValue = mappedLookupObj[descPath];
                        }
                        descData[field] = mappedDescValue;
                    }
                    //For MultiComboBox inside one field multiple values are there in a string format
                    else if (fieldDataType === "MultiComboBox" && lookupData && data[field]) {
                        if (typeof (data[field]) == "string") {
                            arrayData = this.stringToArray(data[field]);
                        }
                        else {
                            arrayData = data[field];
                        }
                        for (let item in arrayData) {
                            let codePath = "MM_KEY",
                                descPath = `${fieldRuleName}_DESC`,
                                mappedLookupObj = null, mappedDescValue = null;
                            mappedLookupObj = lookupData.find(obj =>
                                obj[codePath] == arrayData[item]
                            );
                            if (mappedLookupObj) {
                                mappedDescValue = mappedLookupObj[descPath];
                            }
                            if (descData[field]) {
                                descData[field] += `, ${mappedDescValue}`;
                            } else {
                                descData[field] = mappedDescValue;
                            }
                        }
                    }
                    //For Tree Fields as the lookup data is in a nested form
                    else if (fieldDataType === "Tree" && data[field]) {
                        let mappedDescValue = null;
                        lookupData = MaterialDetails.getProperty(`/ProductDataStatic/TreeData/TreeFields/${field}/lookupData`);
                        if (lookupData) {
                            mappedDescValue = that.getTextInTreeFromKey(lookupData, data[field]);
                        }

                        descData[field] = mappedDescValue;
                    }
                }
                return descData;
            },

            getTextInTreeFromKey: function (tree, searchKey) {
                let findTextByKey = function (data, searchKey) {
                    if (data.key == searchKey) {
                        return data?.text;
                    }
                    // If the node has children, search recursively
                    if (Array.isArray(data?.node)) {
                        for (let child of data.node) {
                            let result = findTextByKey(child, searchKey);
                            if (result) {
                                return result;
                            }
                        }
                    }
                    return null;
                };

                for (let node of tree) {
                    let result = findTextByKey(node, searchKey);
                    if (result) {
                        return result;
                    }
                }
                return null;
            },




            fnFrameBasicDataDescDto: function (basicData, basicData1or2Flag, systemId) {
                var LookupModel = this.getModelDetails("LookupModel"),
                    basicDataList = {},
                    descData = {};
                if (!basicData) {
                    return {};
                }
                if (basicData1or2Flag === "BasicData1") {
                    basicDataList = LookupModel.getProperty("/basicDataList");
                }
                else if (basicData1or2Flag === "BasicData2") {
                    basicDataList = LookupModel.getProperty("/basicData2List");
                }

                for (let element in basicDataList) {
                    let field = basicDataList[element].bindingPath,
                        fieldName = basicDataList[element].fieldName,
                        fieldPath = "/" + field,
                        lookUpData = LookupModel.getProperty(`/oDataLookups/${systemId}${fieldPath}`),
                        fieldDataType = basicDataList[element].fieldType,
                        materialType = this.fnGetRequestHeaderData("materialType");

                    if (field == "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS") {
                        lookUpData = LookupModel.getProperty(`/rulesLookups/${materialType}/${systemId}/${field}`);
                    }
                    if (field == "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE" && lookUpData && (basicData[fieldName] == "" || basicData[fieldName] == "BLANK") && systemId == "1") {
                        let xPlantVal = basicData[fieldName] == "" ? "BLANK" : basicData[fieldName],
                            codePath = basicDataList[element].path_Code,
                            descPath = basicDataList[element].path_Desc,
                            mappedDescValue = null, mappedLookupObj = null;
                        mappedLookupObj = lookUpData.find(obj =>
                            obj[codePath] == xPlantVal
                        );
                        if (mappedLookupObj) {
                            mappedDescValue = mappedLookupObj[descPath];
                        }
                        descData[fieldName] = mappedDescValue;
                    }
                    if ((fieldDataType === "InputSearch" || fieldDataType === "Dropdown") && lookUpData && basicData && basicData[fieldName]) {
                        let codePath = field === "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS" ? "MM_KEY" : basicDataList[element].path_Code,
                            descPath = basicDataList[element].path_Desc,
                            mappedLookupObj = null, mappedDescValue = null;
                        mappedLookupObj = lookUpData.find(obj =>
                            obj[codePath] == basicData[fieldName]
                        );
                        if (mappedLookupObj) {
                            mappedDescValue = mappedLookupObj[descPath];
                        }
                        descData[fieldName] = mappedDescValue;
                    }
                }
                return descData;
            },

            //Product Data Dynamic Layout 
            fnToLoadProductDataOutline: async function (viewName) {
                return new Promise((resolve) => {
                    var that = this,
                        CreateProject = this.getModelDetails("CreateProject"),
                        LookupModel = this.getModelDetails("LookupModel"),
                        Repository = this.getModelDetails("Repository"),
                        oAppModel = this.getModelDetails("oAppModel"),
                        wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                        productDataFields = null,
                        productDataFieldLayoutPayload = {},
                        materialType = null,
                        requestType = null,
                        materialStatus = null,
                        materialListId = null,
                        materialNumber = null,
                        requestNo = null,
                        applicableIn = null,
                        requestSource = null;
                    if (viewName === "CreateProject") {
                        materialListId = this.fnGetMaterialDetailsSelectedData("materialListId");
                        materialType = this.fnGetRequestHeaderData("materialType");
                        requestType = this.fnGetRequestHeaderData("requestType");
                        materialNumber = this.fnGetMaterialDetailsSelectedData("materialNumber") || null,
                            requestNo = this.fnGetRequestHeaderData("requestNumber");
                        materialStatus = LookupModel.getProperty("/materialStatus");
                        applicableIn = "Request";
                        requestSource = "Request_Management";
                    }
                    else if (viewName === "Repository") {
                        materialType = Repository.getProperty("/MaterialSelected/materialTypeId");
                        productDataFields = Repository.getProperty(`/ProductData/outlineReference/${materialType}`);
                        materialNumber = Repository.getProperty("/MaterialSelected/materialNumber");
                        applicableIn = "Repository";
                        requestSource = "Repository";
                        requestType = 0 //Need to pass 0 for render in Repo
                        if(!materialNumber){
                            return;
                        }
                    }
                    productDataFieldLayoutPayload = {
                        "applicableIn": applicableIn,
                        "materialTypeId": parseInt(materialType) || null,
                        "requestTypeId": isNaN(parseInt(requestType)) ? null : parseInt(requestType),
                        "requestNumber": parseInt(requestNo) || null,
                        "materialNumber": parseInt(materialNumber) || null,
                        "materialListId": materialListId,
                        "uiView": "Product_Data",
                        "requestSource": requestSource,
                        "wfTaskType": wfTaskType
                    }

                    if (!productDataFields) {
                        this.fnProcessDataRequest("MM_JAVA/getFieldLayout", "POST", null, true, productDataFieldLayoutPayload,
                            function (responseData) {
                                if (responseData?.statusCode == "200") {
                                    productDataFields = responseData?.responseDto;
                                    if (viewName === "Repository") {
                                        productDataFields = JSON.parse(JSON.stringify(productDataFields));
                                        Repository.setProperty(`/ProductData/outlineReference/${materialType}`, productDataFields);
                                    }
                                    that.fnAfterRenderProductDataView(productDataFields, viewName).then(function () {
                                        resolve(true);
                                    });
                                }
                                else {
                                    that.closeBusyDialog();
                                    var msg = that.geti18nText("FailuretoRenderofProductDataFields"),
                                        actions = ["OK"];
                                    that.showMessage(msg, "E", actions, "OK", function (action) {
                                        if (action === "OK") {
                                            if (wfTaskType === "Request_Form_Submission") {
                                                that.navigateTo("RequestManagement");
                                            }
                                            else {
                                                window.top.close();
                                            }
                                        }
                                    });
                                }
                            },
                            function (error) {
                                that.closeBusyDialog();
                                var msg = that.geti18nText("FailuretoRenderofProductDataFields"),
                                    actions = ["OK"];
                                that.showMessage(msg, "E", actions, "OK", function (action) {
                                    if (action === "OK") {
                                        if (wfTaskType === "Request_Form_Submission") {
                                            that.navigateTo("RequestManagement");
                                        }
                                        else {
                                            window.top.close();
                                        }
                                    }
                                });
                            }
                        );
                    }
                    else {
                        that.fnAfterRenderProductDataView(productDataFields, viewName).then(function () {
                            resolve(true);
                        });
                    }
                });
            },

            fnToRenderProductDataView: function (productDataFields) {
                return new Promise((resolve) => {
                    let MaterialDetails = this.getModelDetails("MaterialDetails"),
                        CreateProject = this.getModelDetails("CreateProject"),
                        Repository = this.getModelDetails("Repository"),
                        attributeListProdData,
                        LookupModel = this.getModelDetails("LookupModel"),
                        oResourceBundle = this.getView().getModel("i18n").getResourceBundle(),
                        viewName = this.getViewName(),
                        oAppModel = this.getModelDetails("oAppModel"),
                        currentUserRole = oAppModel.getProperty("/userdetails/userRole"),
                        viewSource = this.getViewName(),
                        isUserRequestOwner = CreateProject.getProperty("/GeneralData/isUserRequestOwner"),
                        wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                        productDataVBoxID = this.getView().byId("productDataVBoxID"),
                        vh_P_FieldType = LookupModel.getProperty("/valueHelpSet/cInput_Type"),
                        requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                        productDataOutline = {},
                        combobox_Fields = [],
                        Tree_Fields = [],
                        oView = this.getView(),
                        productDataFieldsArray = this.fnMakeIterableArray(productDataFields),
                        that = this;

                    switch (viewSource) {
                        case "CreateProject":
                            attributeListProdData = CreateProject.getProperty("/MaterialList/generalDetails/attributeListProdData");
                            break;
                        case "Repository":
                            let selectedMatType = Repository.getProperty("/MaterialSelected/materialTypeId");
                            attributeListProdData = Repository.getProperty(`/GeneralData/attributeListProdData/${selectedMatType}`);
                            break;
                    }

                    MaterialDetails.setProperty("/ProductData", {}); // To Empty the Product Data 
                    productDataVBoxID.removeAllItems();
                    for (let item of productDataFieldsArray) { //Finding Class Name
                        let keyIndex = item?.key,
                            isLongDescClass = keyIndex === "Long_Description" ? true : false,
                            fieldList = productDataFields[keyIndex],  // Get the Class Attributes
                            classPath = "/ProductData/" + keyIndex,
                            cPanel = that.fnCreatePanel(keyIndex),
                            cGrid = that.fnCreateGrid(isLongDescClass),
                            dataOuline = {
                                "data": {},
                                "oldData": {},
                                "MM_UI_FIELD_TYPE": {},
                                "MM_SAP_RELEVANT": {},
                                "MM_ACTIVE": {},
                                "MM_MANDATORY": {},
                                "MM_VISIBILITY": {},
                                "MM_EDITABLE": {},
                                "MM_DEFAULT_VALUE": {},
                                "MM_MAX_CHAR_LENGTH": {},
                                "MM_DATA_TYPE": {},
                                "MM_LOOKUP_RULE_NAME": {},
                                "Additional_Data": {},
                                "valueState": {},
                                "valueStateMessage": {},
                                "MM_LOOKUP_OTHER_VALUE_OPTION": {}
                            };
                        if (keyIndex === "Alternate_ID_Table") {
                            fieldList.map(function (field) {
                                if (field.MM_ATTRIBUTE_ID === "Field_Value") {
                                    MaterialDetails.setProperty("/ProductDataStatic/alternateID/Max_Value_" + field.MM_ATTRIBUTE_ID, field.MM_MAX_CHAR_LENGTH);
                                }
                                else if (field.MM_ATTRIBUTE_ID === "Alternate_ID_Type" && !(viewName === "Repository")) {
                                    // if((!(currentUserRole?.includes("Repository Edit")) && field && viewSource === "Repository") || (!isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewSource === "CreateProject")){
                                    //     field.MM_EDITABLE = "No"
                                    // }
                                    if ((!isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewSource === "CreateProject")) {
                                        field.MM_EDITABLE = "No"
                                    }
                                    let isAltIDEditable = field.MM_EDITABLE === "Yes" ? true : false;
                                    MaterialDetails.setProperty("/ProductDataStatic/alternateID/alternateIDBtns/visible", isAltIDEditable);
                                }
                            })
                            this.LoadFragment("AlternateIDTable", oView, false).then(function (oFragment) {
                                cPanel.addContent(oFragment);
                                productDataVBoxID.addItem(cPanel);
                            });
                        }
                        else {
                            MaterialDetails.setProperty(classPath, dataOuline);
                            fieldList.map(function (field) {  //Iterate each fields =
                                //Variable name -> P_ (Property for Control), PP_ (Property Path for the Control)
                                let fieldName = field.MM_ATTRIBUTE_ID,
                                    P_MaxChar = field.MM_MAX_CHAR_LENGTH,
                                    // P_Mandatory = field.MM_MANDATORY === "Yes" ? true : false,            // Mandatory being set in 
                                    P_Mandatory = false,                                                     // getFieldLayout second call
                                    P_Editable = field.MM_EDITABLE === "Yes" ? true : false,
                                    PP_Editable = "{MaterialDetails>" + classPath + "/MM_EDITABLE/" + fieldName + "}",
                                    P_Visible = field.MM_VISIBILITY === "Yes" ? true : false,
                                    P_OtherOption = field.MM_LOOKUP_OTHER_VALUE_OPTION === "Yes" ? true : false,
                                    P_FieldType = vh_P_FieldType[field.MM_DATA_TYPE],
                                    P_SecValue = false,
                                    P_DefaultValue = field.MM_DEFAULT_VALUE,
                                    PP_LabelName,
                                    PP_Mandatory = "{MaterialDetails>" + classPath + "/MM_MANDATORY/" + fieldName + "}",
                                    PP_ValueState = "{MaterialDetails>" + classPath + "/valueState/" + fieldName + "}",
                                    PP_Visible = "{MaterialDetails>" + classPath + "/MM_VISIBILITY/" + fieldName + "}",
                                    PP_PlaceholderText_Enter,
                                    PP_PlaceholderText_Select,
                                    PP_Value = "", PP_Item = "", PP_Key = "", PP_ItemKey = "", PP_ItemCode = "", PP_ItemDesc = "", combobox_Fields_Object = null,
                                    PP_Items = [], P_MaxSelectedItems = "", PP_SelectedKeys = [],
                                    cVBox = that.fnCreateVBox(PP_Visible),
                                    cLabel,
                                    cData = null,
                                    fieldNameValue = (attributeListProdData?.find(item => item?.attribute == fieldName))?.attribute_value || fieldName;

                                // if (oResourceBundle.hasText(fieldNameValue)) {
                                if (fieldNameValue?.includes("Full_Path")) {
                                    let originalField = fieldNameValue?.replace(/(_Full_Path)$/, '');
                                    fieldNameValue = (attributeListProdData?.find(item => item?.attribute == originalField))?.attribute_value;

                                    PP_LabelName = "{i18n>" + fieldNameValue + "} {i18n>FullPath}";
                                    PP_PlaceholderText_Enter = "{i18n>Enter} {i18n>" + fieldNameValue + "} {i18n>FullPath}";
                                    PP_PlaceholderText_Select = "{i18n>Select} {i18n>" + fieldNameValue + "} {i18n>FullPath}";
                                }
                                else if (fieldNameValue?.includes("Other")) {
                                    let originalField = fieldNameValue?.replace(/(_Other)$/, '');
                                    fieldNameValue = (attributeListProdData?.find(item => item?.attribute == originalField))?.attribute_value;

                                    PP_LabelName = "{i18n>" + fieldNameValue + "} {i18n>Other}";
                                    PP_PlaceholderText_Enter = "{i18n>Enter} {i18n>" + fieldNameValue + "} {i18n>Other}";
                                    PP_PlaceholderText_Select = "{i18n>Select} {i18n>" + fieldNameValue + "} {i18n>Other}";
                                }
                                else {
                                    PP_LabelName = "{i18n>" + fieldNameValue + "}";
                                    PP_PlaceholderText_Enter = "{i18n>Enter} {i18n>" + fieldNameValue + "}";
                                    PP_PlaceholderText_Select = "{i18n>Select} {i18n>" + fieldNameValue + "}";
                                }

                                // }
                                // else {
                                //     try {
                                //         PP_LabelName = (attributeListProdData?.find(item => item?.attribute == fieldName)).attribute_value;
                                //         PP_PlaceholderText_Enter = "{i18n>Enter} " + PP_LabelName;
                                //         PP_PlaceholderText_Select = "{i18n>Select} " + PP_LabelName;
                                //     }
                                //     catch (e) {
                                //         PP_LabelName = "{i18n>" + fieldName + "}";
                                //         PP_PlaceholderText_Enter = "{i18n>Enter} {i18n>" + fieldName + "}";
                                //         PP_PlaceholderText_Select = "{i18n>Select} {i18n>" + fieldName + "}";
                                //     }
                                // }
                                cLabel = field.MM_UI_FIELD_TYPE != "CheckBox" ? that.fnCreateLabel(PP_LabelName, PP_Mandatory) : null,
                                    cVBox.addItem(cLabel);
                                MaterialDetails.setProperty(classPath + "/MM_MANDATORY/" + fieldName, P_Mandatory);
                                MaterialDetails.setProperty(classPath + "/MM_VISIBILITY/" + fieldName, P_Visible);
                                MaterialDetails.setProperty(classPath + "/MM_UI_FIELD_TYPE/" + fieldName, field.MM_UI_FIELD_TYPE);
                                MaterialDetails.setProperty(classPath + "/MM_SAP_RELEVANT/" + fieldName, field.MM_SAP_RELEVANT);
                                MaterialDetails.setProperty(classPath + "/MM_MAX_CHAR_LENGTH/" + fieldName, P_MaxChar);
                                MaterialDetails.setProperty(classPath + "/MM_ACTIVE/" + fieldName, field.MM_ACTIVE);
                                MaterialDetails.setProperty(classPath + "/MM_DATA_TYPE/" + fieldName, field.MM_DATA_TYPE);
                                MaterialDetails.setProperty(classPath + "/valueState/" + fieldName, "None");
                                MaterialDetails.setProperty(classPath + "/data/" + fieldName, null);
                                MaterialDetails.setProperty(classPath + "/MM_LOOKUP_OTHER_VALUE_OPTION/" + fieldName, P_OtherOption);
                                if (viewName === "Repository") {
                                    MaterialDetails.setProperty(classPath + "/MM_EDITABLE/" + fieldName, false);
                                }
                                if (P_DefaultValue !== `""`) {
                                    MaterialDetails.setProperty(classPath + "/MM_DEFAULT_VALUE/" + fieldName, P_DefaultValue);
                                }
                                switch (field.MM_UI_FIELD_TYPE) {
                                    case "InputText":
                                        PP_Value = "{MaterialDetails>" + classPath + "/data/" + fieldName + "}";
                                        cData = that.fnCreateInput(fieldName, PP_Value, PP_PlaceholderText_Enter, P_MaxChar, PP_Editable, P_FieldType, PP_ValueState, keyIndex, that);
                                        break;
                                    case "TextArea":
                                        PP_Value = "{MaterialDetails>" + classPath + "/data/" + fieldName + "}";
                                        cData = that.fnCreateTextArea(fieldName, PP_Value, PP_PlaceholderText_Enter, P_MaxChar, PP_Editable, P_FieldType, PP_ValueState, that);
                                        break;
                                    case "CheckBox":
                                        PP_Value = "{MaterialDetails>" + classPath + "/data/" + fieldName + "}";
                                        cData = that.fnCreateCheckbox(PP_Value, PP_LabelName, PP_Editable, that);
                                        break;
                                    case "Dropdown":
                                        let lookupRuleName = field?.MM_LOOKUP_RULE_NAME;
                                        P_SecValue = true;
                                        PP_Key = "{MaterialDetails>" + classPath + "/data/" + fieldName + "}";
                                        PP_Item = "LookupModel>/" + fieldName;
                                        PP_ItemKey = `{LookupModel>MM_KEY}`;
                                        PP_ItemDesc = `{LookupModel>${field.MM_LOOKUP_RULE_NAME}_DESC}`;
                                        PP_ItemCode = `{LookupModel>${field.MM_LOOKUP_RULE_NAME}_CODE}`;
                                        PP_Value = "{MaterialDetails>" + classPath + "/Additional_Data/" + fieldName + "}";
                                        MaterialDetails.setProperty(classPath + "/MM_LOOKUP_RULE_NAME/" + fieldName, field.MM_LOOKUP_RULE_NAME);
                                        cData = that.fnCreateComboBox(lookupRuleName, fieldName, PP_Key, PP_PlaceholderText_Select, PP_Item, PP_ItemKey, PP_ItemDesc, PP_ItemCode, P_SecValue, PP_Editable, PP_ValueState, that);
                                        combobox_Fields_Object = {
                                            MM_LOOKUP_RULE_NAME: field.MM_LOOKUP_RULE_NAME,
                                            fieldName: fieldName,
                                            MM_Lookup_Other_Option: P_OtherOption,
                                            FIELD_TYPE: field.MM_UI_FIELD_TYPE
                                        };
                                        combobox_Fields.push(combobox_Fields_Object);
                                        break;
                                    case "InputSearch":
                                        PP_Value = "{MaterialDetails>" + classPath + "/data/" + fieldName + "}";
                                        PP_Item = "LookupModel>/" + fieldName;
                                        //PP_ItemKey = `{LookupModel>MM_KEY}`;
                                        PP_ItemKey = `{LookupModel>${field.MM_LOOKUP_RULE_NAME}_CODE}`;
                                        PP_ItemDesc = `{LookupModel>${field.MM_LOOKUP_RULE_NAME}_DESC}`;
                                        MaterialDetails.setProperty(classPath + "/MM_LOOKUP_RULE_NAME/" + fieldName, field.MM_LOOKUP_RULE_NAME);
                                        cData = that.fnCreateInput_Suggestion(PP_Value, PP_PlaceholderText_Enter, P_MaxChar, PP_Editable, P_FieldType, PP_ValueState, PP_Item, PP_ItemKey, PP_ItemDesc, keyIndex, that, true, (oEvent) => {
                                            let selectedPath = oEvent.getSource().getBindingInfo("selectedKey").binding.sPath;
                                            that.onLoadOtherFieldsDynamically(selectedPath);
                                        });
                                        combobox_Fields_Object = {
                                            MM_LOOKUP_RULE_NAME: field.MM_LOOKUP_RULE_NAME,
                                            fieldName: fieldName,
                                            MM_Lookup_Other_Option: P_OtherOption,
                                            FIELD_TYPE: field.MM_UI_FIELD_TYPE
                                        };
                                        combobox_Fields.push(combobox_Fields_Object);
                                        break;
                                    case "Tree":
                                        let PP_Tree = "MaterialDetails>/ProductDataStatic/TreeData/CurrentTree/lookupData",
                                            PP_TreeText = "{MaterialDetails>text}",
                                            PP_TreeId = "MaterialDetails>key",
                                            PP_Value_Text = classPath + "/Additional_Data/" + fieldName,
                                            PP_Value_Key = classPath + "/data/" + fieldName;
                                        PP_Value = "{MaterialDetails>" + classPath + "/Additional_Data/" + fieldName + "}";
                                        var tree = that.fnCreateTree(PP_Tree, PP_TreeText, PP_TreeId, fieldName, PP_Value_Text, PP_Value_Key, that, that.handleNodePress);
                                        const onOpenTreeFragment = async (oEvent) => {
                                            let oview = that.getView(),
                                                requestSource = that.getRequestSource(),
                                                //Get the attribute name from oButton control
                                                //from custom property that we set in oButton
                                                fieldName = oEvent.getSource().data("fieldName"),
                                                hierarchyData = MaterialDetails.getProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}/lookupData`),
                                                treeFieldsObjects = MaterialDetails.getProperty("/ProductDataStatic/TreeData/TreeField_Objects"),
                                                currentTreeFieldObject = treeFieldsObjects?.find(item => item.fieldName === fieldName),
                                                url = "MM_JAVA/getHierarchyStructure",
                                                payload = {
                                                    "requestNumber": requestNumber || null,
                                                    "mmAttributeId": fieldName,
                                                    "applicableIn": requestSource
                                                }
                                            // var tree = that.fnCreateTree(PP_Tree, PP_TreeText, PP_TreeId, fieldName, PP_Value_Text, PP_Value_Key, that, that.handleNodePress);
                                            await that.LoadFragment("ProductDataTree", oview, true);
                                            MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/headerName", that.geti18nText(fieldName));
                                            MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/fieldName", fieldName);
                                            if (!hierarchyData) {
                                                let treeFieldData = MaterialDetails.getProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}`);
                                                if (!treeFieldData) {
                                                    MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}`, {});
                                                }
                                                that.fnProcessDataRequest(url, "POST", null, true, payload,
                                                    function (responseData) {
                                                        responseData = that.sortTreeData(responseData);
                                                        MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/lookupData", responseData);
                                                        MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}/lookupData`, responseData);
                                                        that.setOtherValueinTreeLookup(responseData, currentTreeFieldObject);
                                                        that.closeBusyDialog();
                                                    },
                                                    function (responseData) {
                                                        that.closeBusyDialog();
                                                    })
                                            }
                                            else {
                                                MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/lookupData", hierarchyData);
                                            }
                                            let vboxTreeContainer = that.byId("vboxTreeContainer");
                                            vboxTreeContainer.removeAllItems();
                                            vboxTreeContainer.addItem(tree);
                                        }
                                        cData = that.fnCreateInputWithSuggestionBtn(PP_Value, PP_PlaceholderText_Select, P_MaxChar, false, "Text", PP_ValueState, onOpenTreeFragment, fieldName, PP_Editable);
                                        let Tree_Fields_Object = {
                                            MM_LOOKUP_RULE_NAME: field.MM_LOOKUP_RULE_NAME,
                                            fieldName: fieldName,
                                            MM_Lookup_Other_Option: P_OtherOption,
                                            FIELD_TYPE: field.MM_UI_FIELD_TYPE
                                        };
                                        Tree_Fields.push(Tree_Fields_Object);
                                        break;
                                    case "MultiComboBox":
                                        // Need to define PP_Items and PP_SelectedKeys based on service
                                        PP_Items = "LookupModel>/" + fieldName,
                                            P_SecValue = true,
                                            // PP_ItemKey = `{LookupModel>${field.MM_LOOKUP_RULE_NAME}_CODE}`;
                                            PP_ItemKey = `{LookupModel>MM_KEY}`;
                                        PP_ItemDesc = `{LookupModel>${field.MM_LOOKUP_RULE_NAME}_DESC}`;
                                        PP_ItemCode = `{LookupModel>${field.MM_LOOKUP_RULE_NAME}_CODE}`;
                                        PP_SelectedKeys = "{MaterialDetails>" + classPath + "/data/" + fieldName + "}";
                                        P_SecValue = true;
                                        MaterialDetails.setProperty(classPath + "/MM_LOOKUP_RULE_NAME/" + fieldName, field.MM_LOOKUP_RULE_NAME);
                                        cData = that.fnCreateMultiComboBox(fieldName, PP_SelectedKeys, PP_PlaceholderText_Select, PP_Items, PP_ItemKey, PP_ItemDesc, PP_ItemCode, P_SecValue, PP_Editable, PP_ValueState, that);
                                        MaterialDetails.setProperty(classPath + "/MM_DEFAULT_VALUE/" + fieldName, that.stringToArray(P_DefaultValue));
                                        combobox_Fields_Object = {
                                            MM_LOOKUP_RULE_NAME: field.MM_LOOKUP_RULE_NAME,
                                            fieldName: fieldName,
                                            MM_Lookup_Other_Option: P_OtherOption,
                                            FIELD_TYPE: field.MM_UI_FIELD_TYPE
                                        };
                                        combobox_Fields.push(combobox_Fields_Object);
                                        break;

                                }
                                cVBox.addItem(cData);
                                cGrid.addContent(cVBox);
                            });
                            cPanel.addContent(cGrid);
                            productDataVBoxID.addItem(cPanel);
                        }
                    }
                    productDataOutline = MaterialDetails.getProperty("/ProductData");
                    productDataOutline = JSON.parse(JSON.stringify(productDataOutline));  // to take outline and disconnect the references
                    resolve([productDataOutline, combobox_Fields, Tree_Fields]);
                });
            },

            //Common function for sorting nested data 
            sortTreeData: function(data) {
                if (!Array.isArray(data)) return [];

                data?.sort((a, b) => a.text.localeCompare(b.text));

                data?.forEach(item => {
                    if (Array.isArray(item.node) && item?.node?.length > 0) {
                        item.node = this.sortTreeData(item.node);
                    }
                });

                return data;
            },

            // Product Data : Alternate ID
            onClickAddNewAlternateID: function () {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    newAlternateId = {
                        "materialList": "",
                        "Alternate_ID_Type": "",
                        "Alternate_ID_Type_Country": "",
                        "Field_Value": "",
                        "scenario": "add",
                        "isActive": true
                    };
                this.onLoadingAlternateIdData();
                MaterialDetails.setProperty("/ProductDataStatic/alternateID/newIDData", newAlternateId);
                this.LoadFragment("AddNewAlternateID", oView, true);
            },

            onAltIDSelectionChange: function (oEvent) {
                var bSelected = oEvent.getParameter("selected");   
                var oContext = oEvent.getSource().getBindingContext("MaterialDetails");    // Update the model    
                var sPath = oContext.getPath();
                //oContext.setProperty("/ProductDataStatic/alternateID/newIDData/is_Active", bSelected); 
                var oModel = this.getModelDetails("MaterialDetails");
                oModel.setProperty(sPath + "/isActive", bSelected);
            },

            onSelectNewAlternateId: function (oEvent, selectedAlternateIdType) {
                let that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    systemFilters = [],
                    systemOrders = {
                        "MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST.MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST_DESC": "ASC"
                    },
                    conditions = [{
                        "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": "*"
                    }],
                    payload = {};
                if (oEvent) {
                    selectedAlternateIdType = oEvent.getSource().getSelectedKey()
                }
                systemFilters = [
                    {
                        "column": "MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST.MM_ALTERNATE_TYPE_ID",
                        "operator": "like",
                        "value": `%${selectedAlternateIdType}%`
                    },
                    {
                        "column": "MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST.MM_ACTIVE",
                        "operator": "like",
                        "value": "%Yes%"
                    }
                ];
                payload = that.onGetRulePayload("MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST", conditions, systemOrders, systemFilters);
                MaterialDetails.setProperty("/ProductDataStatic/alternateID/listOfFieldValue", null);
                that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                    function (responseData) {
                        let listOfFieldValue = responseData?.data?.result[0]?.MM_ALTERNATE_ID_FIELD_VALUE_REF_LIST;
                        MaterialDetails.setProperty("/ProductDataStatic/alternateID/listOfFieldValue", listOfFieldValue ? listOfFieldValue : []);

                    },
                    function (error) { }
                );

                if (oEvent) this.onAddingMandatoryValue(oEvent);
            },

            fnAddNewAlternateIdData: function (oEvent) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    newIDData = MaterialDetails.getProperty("/ProductDataStatic/alternateID/newIDData"),
                    selectedIDs = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedIDs");
                if (!selectedIDs) {
                    selectedIDs = [];
                }

                let isNewIdDataUnique = this.fnCheckUniqueAlternateIdCombination(newIDData);
                if (!isNewIdDataUnique && newIDData.Alternate_ID_Type) {
                    newIDData.MM_NEWLY_ADDED = true;
                    newIDData.isDeleted = false;
                    selectedIDs.push(newIDData);
                    MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedIDs", selectedIDs);
                    this.onCancelAlternateId()
                } else {

                }
            },

            fnCheckUniqueAlternateIdCombination: function (newEntry) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    listOfSelectedIds = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedIDs");
                return listOfSelectedIds.some(function (entry) {
                    return entry.Alternate_ID_Type === newEntry.Alternate_ID_Type &&
                        entry.Alternate_ID_Type_Country === newEntry.Alternate_ID_Type_Country &&
                        entry.Field_Value === newEntry.Field_Value;
                });
            },

            onCancelAlternateId: function () {
                this.byId("id_AddNewAlternateID").close();
                this.closeBusyDialog();
            },

            onLoadingAlternateIdData: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    listOfAllIDs = LookupModel.getProperty("/MM_ALTERNATE_ID_TYPE_REF_LIST"),
                    that = this;
                if (!listOfAllIDs) {
                    let conditions = [{
                        "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": null
                    }],
                        systemOrders = {
                            "MM_ALTERNATE_ID_TYPE_REF_LIST.MM_ALTERNATE_ID_TYPE_REF_LIST_DESC": "ASC"
                        },

                        //Commented the system filters as we need the Inactive Alt IDs for view 
                        //purpose for already added Alt IDs

                        // systemFilters = [
                        //     {
                        //         "column": "MM_ALTERNATE_ID_TYPE_REF_LIST.MM_ACTIVE",
                        //         "operator": "like",
                        //         "value": "%Yes%"
                        //     }
                        // ],

                        payload = that.onGetRulePayload("MM_ALTERNATE_ID_TYPE_REF_LIST", conditions, systemOrders, systemFilters);
                    that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                        function (responseData) {
                            listOfAllIDs = responseData?.data?.result[0]?.MM_ALTERNATE_ID_TYPE_REF_LIST;
                            LookupModel.setProperty("/MM_ALTERNATE_ID_TYPE_REF_LIST", listOfAllIDs);
                            that.updateIDList();

                        },
                        function (error) { }
                    );
                }
                else {
                    this.updateIDList();

                }
                this.onLoadingCountrySetData();
            },

            updateIDList: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    selectedIDs = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedIDs"),
                    listOfAllIDs = LookupModel.getProperty("/MM_ALTERNATE_ID_TYPE_REF_LIST"),
                    listofFilteredIDs = [];
                if (selectedIDs) {
                    listofFilteredIDs = JSON.parse(JSON.stringify(listOfAllIDs));

                    //Filtering Inactive Alt ID's so that user cant add a Inactive Alt ID
                    //Not filtering while Rule call because Inactive Alt ID are required for
                    //view purpose for already added ALt IDs
                    listofFilteredIDs = listofFilteredIDs.filter(altId => altId.MM_ACTIVE != "No");

                    for (let ID of selectedIDs) {
                        let index = listofFilteredIDs.findIndex(eachID => eachID.MM_KEY == ID.TargetID);
                        if (index != -1) {
                            listofFilteredIDs.splice(index, 1);
                        }
                    }
                }
                MaterialDetails.setProperty("/ProductDataStatic/alternateID/listofFilteredIDs", listofFilteredIDs);
            },

            onClickEditID: function (oEvent) {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedIDData = MaterialDetails.getProperty(selectedPath),
                    newIDData = JSON.parse(JSON.stringify(selectedIDData));
                newIDData = { ...newIDData, ...selectedIDData };
                newIDData.scenario = "edit";
                this.onLoadingAlternateIdData();
                this.onSelectNewAlternateId(null, newIDData.Alternate_ID_Type);
                MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedID", selectedIDData);
                MaterialDetails.setProperty("/ProductDataStatic/alternateID/newIDData", newIDData);

                MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedPath", selectedPath);
                this.LoadFragment("AddNewAlternateID", oView, true);
            },

            fnUpdateExistingAlternateIdData: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    updatedIDData = MaterialDetails.getProperty("/ProductDataStatic/alternateID/newIDData"),
                    selectedPath = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedPath");
                updatedIDData.isModified = true;
                MaterialDetails.setProperty(selectedPath, updatedIDData);
                this.onCancelAlternateId();
            },

            onDeleteAlternateID: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    actions = ["NO", "YES"],
                    that = this,
                    confirmationMsg = this.resourceBundle.getText("deleteConfirmation"),
                    selectedIDs = MaterialDetails.getProperty("/ProductDataStatic/alternateID/selectedIDs"),
                    selectedIDsOld = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/productDataStatic/alternateIdDto"),
                    selectedPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedIndex = parseInt(selectedPath.split('/').pop(10)),
                    selectedAlternateId = MaterialDetails.getProperty(selectedPath),
                    isNewlyAdded = MaterialDetails.getProperty(selectedPath)?.MM_NEWLY_ADDED,
                    requestRowId = selectedAlternateId?.Request_Row_Id,
                    repoRowId = selectedAlternateId?.Repository_Row_ID,
                    materialListId = selectedAlternateId.materialListId,
                    deleteConfirmationExisting = that.geti18nText("deleteConfirmationExisting"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    requestTypeId = this.fnGetRequestHeaderData("requestType");

                    if((currentView === "CreateProject" && requestTypeId == 3 && !isNewlyAdded) || (currentView === "Repository" && !isNewlyAdded)){
                    this.showMessage(deleteConfirmationExisting, "Q", ["YES", "NO"], "YES", async function (action) {
                        if (action === "YES") {
                            selectedIDs?.map(item => {
                                if (item.Repository_Row_ID == repoRowId) {
                                    item.isDeleted = true;
                                    // MaterialDetails.refresh(true);
                                }
                            })
                        }
                    });
                }
                    else{
                    this.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            if (!materialListId || !selectedAlternateId.alternateId || currentView === "Repository") {
                                let filteredData = selectedIDs.splice(selectedIndex, 1);
                                MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedIDs", selectedIDs);
                            }
                            else {
                                let url = `MM_JAVA/deleteAlternateId`,
                                    deleteAlternateIdPayload =
                                    {
                                        "MM_ALTERNATE_ID_REPOSITORY_ROW_ID": repoRowId,
                                        "MM_ALTERNATE_ID_REQUEST_ROW_ID": requestRowId,
                                        "materialListId": materialListId
                                    };
                                that.fnProcessDataRequest(url, "POST", null, true, deleteAlternateIdPayload,
                                    async function (responseData) {
                                        if (responseData?.statusCode === "200") {
                                            selectedIDs.splice(selectedIndex, 1);
                                            MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedIDs", JSON.parse(JSON.stringify(selectedIDs)));

                                            //Updating the old Payload to not have the deleted Alternate ID
                                            selectedIDsOld.splice(selectedIndex, 1);
                                            MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/productDataStatic/alternateIdDto", JSON.parse(JSON.stringify(selectedIDsOld)));
                                        }
                                        // await that.getDatabyMaterialListId(materialListId);
                                        that.onGetFilteredDataMatChangeLog(that.getViewName(), true);
                                        that.closeBusyDialog();
                                    },
                                    function (responseData) { })
                            }
                        }
                    });
                }
            },

            handleNodePress: function (PP_Selected_Text, PP_Selected_Key, Global_this, oEvent) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    sPath = oEvent.getSource().getSelectedItem().getBindingContext("MaterialDetails").sPath,
                    selectedText = MaterialDetails.getProperty(sPath).text,
                    selectedNodeId = MaterialDetails.getProperty(sPath).nodeId,
                    selectedKey = MaterialDetails.getProperty(sPath).key,
                    selectedNodeFullPath = MaterialDetails.getProperty(sPath).nodeFullPath,
                    selectedNode = {
                        "nodeId": selectedNodeId,
                        "nodeText": selectedText,
                        "nodeKey": selectedKey,
                        "nodeFullPath": selectedNodeFullPath
                    }
                MaterialDetails.setProperty(PP_Selected_Text, selectedText);
                MaterialDetails.setProperty(PP_Selected_Key, selectedKey);
                MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/selectedNode", selectedNode);
            },

            onOkTreeFragment: function () {
                let that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    selectedNodeKey = MaterialDetails.getProperty("/ProductDataStatic/TreeData/CurrentTree/selectedNode/nodeKey"),
                    selectedNodeFullPath = MaterialDetails.getProperty("/ProductDataStatic/TreeData/CurrentTree/selectedNode/nodeFullPath"),
                    attributeId = MaterialDetails.getProperty("/ProductDataStatic/TreeData/CurrentTree/fieldName"),
                    toBeRemovedDependentAttributes = MaterialDetails.getProperty(`/ProductDataStatic/TreeData/TreeFields/${attributeId}/notVisibleDependentAttributes`),
                    selectedPath = `/ProductData/Hierarchical_Attributes/data/${attributeId}`,
                    P_FullPathData = null,
                    P_Visible = null,
                    P_Field = null,
                    V_Field = null;

                try {
                    if (attributeId) {
                        P_Visible = "/ProductData/Hierarchical_Attributes/MM_VISIBILITY/" + attributeId + "_Full_Path";
                        P_FullPathData = "/ProductData/Hierarchical_Attributes/data/" + attributeId + "_Full_Path";
                        P_Field = "/ProductData/Hierarchical_Attributes/data/" + attributeId;
                        V_Field = MaterialDetails.getProperty(P_Field);
                    }
                    if (V_Field) {
                        MaterialDetails.setProperty(P_Visible, true);
                        MaterialDetails.setProperty(P_FullPathData, selectedNodeFullPath);
                    }
                    else {
                        MaterialDetails.setProperty(P_Visible, false);
                        MaterialDetails.setProperty(P_FullPathData, null);
                    }
                }
                catch (e) { }
                if (toBeRemovedDependentAttributes) {
                    that.removeDependentAttributes(toBeRemovedDependentAttributes);
                }
                if (selectedNodeKey != "other") {
                    this.getDependentAttributes(requestNumber, attributeId, selectedNodeKey);
                }
                this.onLoadOtherFieldsDynamically(selectedPath);
                this.getView().byId("id_ProductData_Tree").close();
            },

            onClearTreeFragment: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    attributeId = MaterialDetails.getProperty("/ProductDataStatic/TreeData/CurrentTree/fieldName"),
                    toBeRemovedDependentAttributes = MaterialDetails.getProperty(`/ProductDataStatic/TreeData/TreeFields/${attributeId}/notVisibleDependentAttributes`);

                // Reset selected node properties in the model
                MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/selectedNode", null);
                MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/selectedNodeID", null);
                MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/selectedNodeText", "");
                MaterialDetails.setProperty("/ProductDataStatic/TreeData/CurrentTree/selectedNodeKey", null);

                // Clear the value from Binding in the tree field
                MaterialDetails.setProperty(`/ProductData/Hierarchical_Attributes/Additional_Data/${attributeId}`, null);

                // Selected Node removal from UI
                MaterialDetails.setProperty(`/ProductData/Hierarchical_Attributes/data/${attributeId}`, null);

                // Clear attribute-specific full path data and remove it from UI
                if (attributeId) {
                    MaterialDetails.setProperty(`/ProductData/Hierarchical_Attributes/MM_VISIBILITY/${attributeId}_Full_Path`, false);
                    MaterialDetails.setProperty(`/ProductData/Hierarchical_Attributes/data/${attributeId}_Full_Path`, null);
                    MaterialDetails.setProperty(`/ProductData/Hierarchical_Attributes/MM_VISIBILITY/${attributeId}_Other`, false);
                }

                // Remove dependent attributes
                if (toBeRemovedDependentAttributes) {
                    this.removeDependentAttributes(toBeRemovedDependentAttributes);
                }

                this.getView().byId("id_ProductData_Tree").close();
            },

            getDependentAttributes: function (requestNumber, attributeId, selectedNodeKey) {
                let that = this,
                    requestSource = this.getRequestSource(),
                    url = "MM_JAVA/getDependentRuleData",
                    payload = {
                        "requestNumber": requestNumber || null,
                        "key": selectedNodeKey,
                        "applicableIn": requestSource
                    };
                this.fnProcessDataRequest(url, "POST", null, true, payload,
                    function (responseData) {
                        if (responseData) {
                            that.loadDependentAttributes(responseData, attributeId);
                        }
                        that.closeBusyDialog();
                    },
                    function (responseData) {
                        that.closeBusyDialog();
                    })
            },

            loadDependentAttributes: function (dependentAttributes, attributeId) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    Repository = this.getModelDetails("Repository"),
                    notVisibleDependentAttributes = [];
                // attributeId =  MaterialDetails.getProperty("/ProductDataStatic/TreeData/CurrentTree/fieldName");
                for (let attribute of dependentAttributes) {
                    let P_Visible = "/ProductData/Hierarchical_Attributes/MM_VISIBILITY/" + attribute,
                        isVisible = MaterialDetails.getProperty(P_Visible),
                        fieldTypePathRepo = "/ProductData/productDataOutline/Hierarchical_Attributes/MM_UI_FIELD_TYPE/" + attribute,
                        fieldTypePath = "/productDataOutline/Hierarchical_Attributes/MM_UI_FIELD_TYPE/" + attribute,
                        fieldTypeRepo = Repository.getProperty(fieldTypePathRepo),
                        fieldType = CreateProject.getProperty(fieldTypePath);
                    if (!isVisible) {
                        notVisibleDependentAttributes.push(attribute);
                        MaterialDetails.setProperty(P_Visible, true);
                        let fieldData = MaterialDetails.getProperty(`/ProductData/Hierarchical_Attributes/data/${attribute}`);
                        if((fieldType === "Tree" || fieldTypeRepo === "Tree") && fieldData){
                            MaterialDetails.setProperty(`/ProductData/Hierarchical_Attributes/MM_VISIBILITY/${attribute}_Full_Path`, true);
                        }
                    }
                }
                MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${attributeId}/notVisibleDependentAttributes`, notVisibleDependentAttributes);
                MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${attributeId}/DependentAttributes`, dependentAttributes);
            },

            removeDependentAttributes: function (dependentAttributes) {
                let MaterialDetails = this.getModelDetails("MaterialDetails");
                for (let attribute of dependentAttributes) {
                    let P_Visible = "/ProductData/Hierarchical_Attributes/MM_VISIBILITY/" + attribute,
                        P_Data = "/ProductData/Hierarchical_Attributes/data/" + attribute,
                        P_Tree_Field_Text = "/ProductData/Hierarchical_Attributes/Additional_Data/" + attribute,
                        attribute_Field_Type = MaterialDetails.getProperty(`/ProductData/Hierarchical_Attributes/MM_UI_FIELD_TYPE/${attribute}`);
                    MaterialDetails.setProperty(P_Visible, false);
                    MaterialDetails.setProperty(P_Data, null);
                    if (attribute_Field_Type === "Tree") {
                        MaterialDetails.setProperty(P_Tree_Field_Text, null);
                        MaterialDetails.setProperty(`${P_Visible}_Full_Path`, false);
                        MaterialDetails.setProperty(`${P_Data}_Full_Path`, null);
                    }
                }
            },

            fnSetSystemProperties: function (materialListId, materialNumber, viewName) {
                return new Promise((resolve) => {
                    var requestSource = this.fnToGetRequestSource(viewName),
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        CreateProject = this.getModelDetails("CreateProject"),
                        Repository = this.getModelDetails("Repository"),
                        oAppModel = this.getModelDetails("oAppModel"),
                        wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                        requestNumber = CreateProject.getProperty("/RequestHeader/data/requestNumber"),
                        requestType = parseInt(CreateProject.getProperty("/RequestHeader/data/requestType")),
                        repoSubmitFor = Repository.getProperty("/MaterialSelected/repoSubmitFor"),
                        materialTypeIdRepo = Repository.getProperty("/MaterialSelected/materialTypeId"),
                        materialTypeIdReq = this.fnGetRequestHeaderData("materialType"),
                        isUserRequestOwner = CreateProject.getProperty("/GeneralData/isUserRequestOwner"),
                        that = this,
                        requestTypeRepo = repoSubmitFor === "Extend" ? 2 : 3,
                        requestPayload = {
                            "applicableIn": "",
                            "materialListId": materialListId || null,
                            "materialNumber": materialNumber || null,
                            "materialTypeId": requestSource === "Repository" ? parseInt(materialTypeIdRepo) : parseInt(materialTypeIdReq),
                            "requestNumber": requestSource === "Repository" ? null : requestNumber,
                            "requestSource": requestSource,
                            "requestTypeId": requestSource === "Repository" ? requestTypeRepo : requestType,
                            "uiView": "*",
                            "wfTaskType": wfTaskType //GMDM_WF_Task
                        };
                    this.fnProcessDataRequest("MM_JAVA/getSAPDataFieldLayoutGrpByView", "POST", null, true, requestPayload,
                        function (responseData) {
                            let plantListForRequestSpecificModify = responseData?.organisation?.Org_Data?.MM_PLANT_ID?.MM_ATTRIBUTE_PLANT || [],
                                systemListForRequestSpecificModify = responseData?.targetSystem?.System_Data?.MM_SYSTEM_ID?.MM_SYSTEM_ID || [],
                                isEditPlant = responseData?.organisation?.Org_Data?.MM_PLANT_ID?.MM_EDITABLE == "Yes" ? true : false,
                                isEditSystem = responseData?.targetSystem?.System_Data?.MM_SYSTEM_ID?.MM_EDITABLE == "Yes" ? true : false;
                            MaterialDetails.setProperty("/SystemPropertyDetails", responseData?.responseDto1);
                            MaterialDetails.setProperty("/OrganizationalData/plantListForRequestSpecificModify", plantListForRequestSpecificModify);
                            MaterialDetails.setProperty("/SystemData/systemListForRequestSpecificModify", systemListForRequestSpecificModify);
                            if (isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewName === "CreateProject") {
                                MaterialDetails.setProperty("/OrganizationalData/buttonVisibility/editPlant", isEditPlant);
                                MaterialDetails.setProperty("/SystemData/buttonVisibility/editSystem", isEditSystem);
                            }
                            that.closeBusyDialog();
                            resolve(true);
                        },
                        function (errorResp) {
                            that.closeBusyDialog();
                            resolve(true);
                        }
                    )
                })
            },

            //Validation Part
            handleBasicDataProperties: function (system, repositorySystemStatusId, defaultValueIncluded = false) {
                return new Promise(async (resolve, reject) => {
                    try {
                        let b1Results = null,
                            b2Results = null,
                            b3Results = null,
                            b4Results = null,
                            b5Results = null,
                            that = this,
                            viewName = this.gViewName,
                            MaterialDetails = this.getModelDetails("MaterialDetails"),
                            CreateProject = this.getModelDetails("CreateProject"),
                            Repository = this.getModelDetails("Repository"),
                            requestType = parseInt(CreateProject.getProperty("/RequestHeader/data/requestType")),
                            oAppModel = this.getModelDetails("oAppModel"),
                            currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                            wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                            requestSource = this.getRequestSource(viewName),
                            savedCurrentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${system}`),
                            SystemPropertyDetails = MaterialDetails.getProperty("/SystemPropertyDetails"),
                            selectedSystemData = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                            repoSubmitFor = Repository.getProperty("/MaterialSelected/repoSubmitFor"),
                            isUserRequestOwner = CreateProject.getProperty("/GeneralData/isUserRequestOwner");

                        defaultValueIncluded = (currentView == "CreateProject" && requestType == 1 && repositorySystemStatusId == 10) ? true : defaultValueIncluded;

                        let Systemtableobj = selectedSystemData.filter(item => item.MM_SYSTEM_ID == system)[0];
                        if ((!Systemtableobj?.isIncluded || Systemtableobj?.requestSystemStatusId == 13) && viewName === "CreateProject") {
                            resolve(true);
                            return;
                        }
                        if (repositorySystemStatusId == 9 && ((viewName === "Repository" && repoSubmitFor === "Extend") || (requestSource === "Request_Management" && requestType == 2))) {
                            resolve(true);
                            return;
                        }
                        if (!savedCurrentSystemDetails) {
                            //setup the Path for holding the values.
                            const fnmaterialDetailsLocalModelSystemDetailsData = async () => {
                                let MaterialDetailsLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MaterialDetails.json"),
                                    MaterialDetailsLocalModel = new JSONModel();
                                that.getView().setModel(MaterialDetailsLocalModel, "MaterialDetailsLocalModel");
                                await MaterialDetailsLocalModel.loadData(MaterialDetailsLocation);
                                return MaterialDetailsLocalModel.getData()?.SystemDetails;
                            }
                            let MaterialDetailsLocalModelSystemDetailsData = await fnmaterialDetailsLocalModelSystemDetailsData();
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}`, MaterialDetailsLocalModelSystemDetailsData);
                        }


                        try {
                            b1Results = SystemPropertyDetails[system]?.Basic_Data_1;
                        }
                        catch (e) { }
                        try {
                            b2Results = SystemPropertyDetails[system]?.Basic_Data_2;
                        }
                        catch (e) { }
                        try {
                            b3Results = SystemPropertyDetails[system]?.Add_Data_Desc;
                        }
                        catch (e) { }
                        try {
                            b4Results = SystemPropertyDetails[system]?.Add_Data_Basic_Data_Text;
                        }
                        catch (e) { }
                        try {
                            b5Results = SystemPropertyDetails[system]?.Add_Data_UoM;
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalUOM/altUomDefaultFieldVals`, b5Results);
                        }
                        catch (e) { }
                        if (!isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewName === "CreateProject") {
                            that.fnMakeSystemDetailsNonEditable(system);
                        }
                        else {
                            //setting basic data 1 editability
                            if (b1Results) {
                                var basicData1Editability = {
                                    "GeneralDataEdititability": {
                                        "MM_INDUSTRY_SECTOR_MARA_MBRSH": b1Results?.MM_INDUSTRY_SECTOR_MARA_MBRSH?.MM_EDITABLE || false,
                                        "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS": b1Results?.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS?.MM_EDITABLE || false,
                                        "MM_MATERIAL_GROUP_MARA_MATKL": b1Results?.MM_MATERIAL_GROUP_MARA_MATKL?.MM_EDITABLE || false,
                                        "MM_OLD_MATERIAL_NUMBER_MARA_BISMT": b1Results?.MM_OLD_MATERIAL_NUMBER_MARA_BISMT?.MM_EDITABLE || false,
                                        "MM_DIVISION_MARA_SPART": b1Results?.MM_DIVISION_MARA_SPART?.MM_EDITABLE || false,
                                        "MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR": b1Results?.MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR?.MM_EDITABLE || false,
                                        "MM_PRODUCT_ALLOCATION_MARA_KOSCH": b1Results?.MM_PRODUCT_ALLOCATION_MARA_KOSCH?.MM_EDITABLE || false,
                                        "MM_PRODUCT_HIERARCHY_MARA_PRDHA": b1Results?.MM_PRODUCT_HIERARCHY_MARA_PRDHA?.MM_EDITABLE || false,
                                        "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE": b1Results["MM_X-PLANT_MATERIAL_STATUS_MARA_MSTAE"]?.MM_EDITABLE || false,
                                        "MM_VALID_FROM_MARA_DATAB": b1Results?.MM_VALID_FROM_MARA_DATAB?.MM_EDITABLE || false,
                                        "MM_ASSIGN_EFFECT_VALS_MARA_KZEFF": b1Results?.MM_ASSIGN_EFFECT_VALS_MARA_KZEFF?.MM_EDITABLE || false,
                                        "MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA": b1Results?.MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA?.MM_EDITABLE || false,
                                        "MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG": b1Results?.MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG?.MM_EDITABLE || false
                                    },
                                    "ShippingDataEditability": {
                                        "MM_TRANSPORTATION_GROUP_MARA_TRAGR": b1Results?.MM_TRANSPORTATION_GROUP_MARA_TRAGR?.MM_EDITABLE || false
                                    },
                                    "MatAuthGroupEdititability": {
                                        "MM_AUTHORIZATION_GROUP_MARA_BEGRU": b1Results?.MM_AUTHORIZATION_GROUP_MARA_BEGRU?.MM_EDITABLE || false
                                    },
                                    "DimensionsEansEdititability": {
                                        "MM_GROSS_WEIGHT_MARA_BRGEW": b1Results?.MM_GROSS_WEIGHT_MARA_BRGEW?.MM_EDITABLE || false,
                                        "MM_WEIGHT_UNIT_MARM_GEWEI": b1Results?.MM_WEIGHT_UNIT_MARM_GEWEI?.MM_EDITABLE || false,
                                        "MM_NET_WEIGHT_MARA_NTGEW": b1Results?.MM_NET_WEIGHT_MARA_NTGEW?.MM_EDITABLE || false,
                                        "MM_VOLUME_MARM_VOLUM": b1Results?.MM_VOLUME_MARM_VOLUM?.MM_EDITABLE || false,
                                        "MM_VOLUME_UNIT_MARM_VOLEH": b1Results?.MM_VOLUME_UNIT_MARM_VOLEH?.MM_EDITABLE || false,
                                        "MM_SIZE_DIMENSIONS_MARA_GROES": b1Results?.MM_SIZE_DIMENSIONS_MARA_GROES?.MM_EDITABLE || false,
                                        "MM_EAN_UPC_MARA_EAN11": b1Results?.MM_EAN_UPC_MARA_EAN11?.MM_EDITABLE || false,
                                        "MM_EAN_CATEGORY_MARA_NUMTP": b1Results?.MM_EAN_CATEGORY_MARA_NUMTP?.MM_EDITABLE || false
                                    },
                                    "PackagingMatDataEdititability": {
                                        "MM_MATL_GRP_PACK_MATLS_MARA_MAGRV": b1Results?.MM_MATL_GRP_PACK_MATLS_MARA_MAGRV?.MM_EDITABLE || false,
                                        "MM_REF_MAT_FOR_PCKG_MARA_RMATP": b1Results?.MM_REF_MAT_FOR_PCKG_MARA_RMATP?.MM_EDITABLE || false
                                    },
                                    "AdvTrackTraceEdititability": {
                                        "MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE": b1Results?.MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE?.MM_EDITABLE || false,
                                        "MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF": b1Results?.MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF?.MM_EDITABLE || false,
                                        "MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT": b1Results?.MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT?.MM_EDITABLE || false,
                                        "MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT": b1Results?.MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT?.MM_EDITABLE || false,
                                        "MM_LAST_SYNCHRONIZED_MARA_DATS": b1Results?.MM_LAST_SYNCHRONIZED_MARA_DATS?.MM_EDITABLE || false
                                    }
                                };
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/generalData/editable`, basicData1Editability.GeneralDataEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/shippingData/editable`, basicData1Editability.ShippingDataEditability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/matAuthGroup/editable`, basicData1Editability.MatAuthGroupEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/dimensionsEans/editable`, basicData1Editability.DimensionsEansEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/packagingMatData/editable`, basicData1Editability.PackagingMatDataEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/advTrackTrace/editable`, basicData1Editability.AdvTrackTraceEdititability);
                            }
                            //setting basic data 2 editability
                            if (b2Results) {
                                var basicData2Editability = {
                                    "otherDataEdititability": {
                                        "MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH": b2Results?.MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH?.MM_EDITABLE || false,
                                        "MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT": b2Results?.MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT?.MM_EDITABLE || false,
                                        "MM_IND_DESCRIPTION_MARA_NORMT": b2Results?.MM_IND_DESCRIPTION_MARA_NORMT?.MM_EDITABLE || false,
                                        "MM_CAD_INDICATOR_MARA_CADKZ": b2Results?.MM_CAD_INDICATOR_MARA_CADKZ?.MM_EDITABLE || false,
                                        "MM_BASIC_MATERIAL_MARA_WRKST": b2Results?.MM_BASIC_MATERIAL_MARA_WRKST?.MM_EDITABLE || false,
                                        "MM_MEDIUM_MARA_MEDIUM": b2Results?.MM_MEDIUM_MARA_MEDIUM?.MM_EDITABLE || false
                                    },
                                    "environmentEdititability": {
                                        "MM_DG_INDICATOR_PROFILE_MARA_PROFL": b2Results?.MM_DG_INDICATOR_PROFILE_MARA_PROFL?.MM_EDITABLE || false,
                                        "MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW": b2Results?.MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW?.MM_EDITABLE || false,
                                        "MM_IN_BULK_LIQUID_MARA_ILOOS": b2Results?.MM_IN_BULK_LIQUID_MARA_ILOOS?.MM_EDITABLE || false,
                                        "MM_HIGHLY_VISCOS_MARA_IHIVI": b2Results?.MM_HIGHLY_VISCOS_MARA_IHIVI?.MM_EDITABLE || false
                                    },
                                    "designDocAssignedEdititability": {
                                        "MM_NO_LINK": b2Results?.MM_NO_LINK?.MM_EDITABLE || false
                                    },
                                    "designdrawingEdititability": {
                                        "MM_DOCUMENT_MARA_ZEINR": b2Results?.MM_DOCUMENT_MARA_ZEINR?.MM_EDITABLE || false,
                                        "MM_DOCUMENT_TYPE_MARA_ZEIAR": b2Results?.MM_DOCUMENT_TYPE_MARA_ZEIAR?.MM_EDITABLE || false,
                                        "MM_DOCUMENT_VERSION_MARA_ZEIVR": b2Results?.MM_DOCUMENT_VERSION_MARA_ZEIVR?.MM_EDITABLE || false,
                                        "MM_PAGE_NUMBER_MARA_BLATT": b2Results?.MM_PAGE_NUMBER_MARA_BLATT?.MM_EDITABLE || false,
                                        "MM_DOC_CH_NO_MARA_AESZN": b2Results?.MM_DOC_CH_NO_MARA_AESZN?.MM_EDITABLE || false,
                                        "MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO": b2Results?.MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO?.MM_EDITABLE || false,
                                        "MM_NO_SHEETS_MARA_BLANZ": b2Results?.MM_NO_SHEETS_MARA_BLANZ?.MM_EDITABLE || false
                                    },
                                    "clientSpecificConfigEdititability": {
                                        "MM_CROSS_PLANT_CM_MARA_SATNR": b2Results?.MM_CROSS_PLANT_CM_MARA_SATNR?.MM_EDITABLE || false,
                                        "MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG": b2Results?.MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG?.MM_EDITABLE || false,
                                        "MM_VARIANT": b2Results?.MM_VARIANT?.MM_EDITABLE || false
                                    }
                                };
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/otherData/editable`, basicData2Editability.otherDataEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/environment/editable`, basicData2Editability.environmentEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designDocAssigned/editable`, basicData2Editability.designDocAssignedEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designdrawing/editable`, basicData2Editability.designdrawingEdititability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/clientSpecificConfig/editable`, basicData2Editability.clientSpecificConfigEdititability);
                            }
                            //setting descriptionData editability
                            if (b3Results) {
                                let additionalDataDescEditability = b3Results?.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX?.MM_EDITABLE,
                                    descMaxLength = (b3Results?.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX?.MM_MAX_CHAR_LENGTH);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/descriptionData/descAddBtnEnabled`, additionalDataDescEditability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/descriptionData/descMaxLength`, descMaxLength);
                            }
                            //setting basicDataText editability
                            if (b4Results) {
                                var additionalDataBasicDataTextEditability = b4Results?.MM_MATERIAL_LONG_DESC_STXH_TDNAME?.MM_EDITABLE,
                                    basicTextMaxLength = (b4Results?.MM_MATERIAL_LONG_DESC_STXH_TDNAME?.MM_MAX_CHAR_LENGTH);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/basicDataText/basicTextAddBtnEnabled`, additionalDataBasicDataTextEditability);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/basicDataText/basicTextMaxLength`, basicTextMaxLength);
                            }
                            //setting altUom editability
                            if (b5Results) {
                                var additionalDataUomEditability = b5Results?.MM_ALTERNATE_UNIT_MARM_MEINH?.MM_EDITABLE;
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/additionalUom/addUomAddBtnEnabled`, additionalDataUomEditability);
                            }
                        }


                        //Defaulting Basic Datas for Create or Extend
                        if (((requestType == '1' || requestType == '2') && defaultValueIncluded) || (currentView === "Repository" && defaultValueIncluded)) {
                            if (b1Results) {
                                let LookupModel = this.getModelDetails("LookupModel"),
                                    basicData1BaseUomVal = b1Results?.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS?.MM_DEFAULT_VALUE,
                                    basicData1XPlantVal = b1Results["MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE"]?.MM_DEFAULT_VALUE,
                                    isBaseUomDefValPresent = false,
                                    isXPlantDefValPresent = false,
                                    baseUomLookupList = LookupModel.getProperty("/selectedRulesSystemDataDropdown/MM_BASE_UNIT_OF_MEASURE_MARM_MEINS"),
                                    xPlantLookupList = LookupModel.getProperty(`/oDataLookups/${system}/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`);
                                baseUomLookupList?.map(item => {
                                    if (item.MM_KEY == basicData1BaseUomVal) {
                                        isBaseUomDefValPresent = true;
                                    }
                                })
                                xPlantLookupList?.map(item => {
                                    if (item.MaterialStatus == basicData1XPlantVal) {
                                        isXPlantDefValPresent = true;
                                    }
                                })
                                //setting basic data 1 defaulting
                                var basicData1Default = {
                                    "generalData": {
                                        "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS": isBaseUomDefValPresent ? (b1Results?.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS?.MM_DEFAULT_VALUE) : null,
                                        "MM_MATERIAL_GROUP_MARA_MATKL": b1Results?.MM_MATERIAL_GROUP_MARA_MATKL?.MM_DEFAULT_VALUE,
                                        "MM_OLD_MATERIAL_NUMBER_MARA_BISMT": b1Results?.MM_OLD_MATERIAL_NUMBER_MARA_BISMT?.MM_DEFAULT_VALUE,
                                        "MM_DIVISION_MARA_SPART": b1Results?.MM_DIVISION_MARA_SPART?.MM_DEFAULT_VALUE,
                                        "MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR": b1Results?.MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR?.MM_DEFAULT_VALUE,
                                        "MM_PRODUCT_ALLOCATION_MARA_KOSCH": b1Results?.MM_PRODUCT_ALLOCATION_MARA_KOSCH?.MM_DEFAULT_VALUE,
                                        "MM_PRODUCT_HIERARCHY_MARA_PRDHA": b1Results?.MM_PRODUCT_HIERARCHY_MARA_PRDHA?.MM_DEFAULT_VALUE,
                                        "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE": isXPlantDefValPresent ? (b1Results["MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE"]?.MM_DEFAULT_VALUE) : null,
                                        "MM_VALID_FROM_MARA_DATAB": b1Results?.MM_VALID_FROM_MARA_DATAB?.MM_DEFAULT_VALUE,
                                        "MM_ASSIGN_EFFECT_VALS_MARA_KZEFF": b1Results?.MM_ASSIGN_EFFECT_VALS_MARA_KZEFF?.MM_DEFAULT_VALUE || false,
                                        "MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA": b1Results?.MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA?.MM_DEFAULT_VALUE,
                                        "MM_INDUSTRY_SECTOR_MARA_MBRSH": b1Results?.MM_INDUSTRY_SECTOR_MARA_MBRSH?.MM_DEFAULT_VALUE,
                                        "MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG": b1Results?.MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG?.MM_DEFAULT_VALUE
                                    },
                                    "shippingData": {
                                        "MM_TRANSPORTATION_GROUP_MARA_TRAGR": b1Results?.MM_TRANSPORTATION_GROUP_MARA_TRAGR?.MM_DEFAULT_VALUE
                                    },
                                    "matAuthGroup": {
                                        "MM_AUTHORIZATION_GROUP_MARA_BEGRU": b1Results?.MM_AUTHORIZATION_GROUP_MARA_BEGRU?.MM_DEFAULT_VALUE
                                    },
                                    "dimensionsEans": {
                                        "MM_GROSS_WEIGHT_MARA_BRGEW": b1Results?.MM_GROSS_WEIGHT_MARA_BRGEW?.MM_DEFAULT_VALUE,
                                        "MM_WEIGHT_UNIT_MARM_GEWEI": b1Results?.MM_WEIGHT_UNIT_MARM_GEWEI?.MM_DEFAULT_VALUE,
                                        "MM_NET_WEIGHT_MARA_NTGEW": b1Results?.MM_NET_WEIGHT_MARA_NTGEW?.MM_DEFAULT_VALUE,
                                        "MM_VOLUME_MARM_VOLUM": b1Results?.MM_VOLUME_MARM_VOLUM?.MM_DEFAULT_VALUE,
                                        "MM_VOLUME_UNIT_MARM_VOLEH": b1Results?.MM_VOLUME_UNIT_MARM_VOLEH?.MM_DEFAULT_VALUE,
                                        "MM_SIZE_DIMENSIONS_MARA_GROES": b1Results?.MM_SIZE_DIMENSIONS_MARA_GROES?.MM_DEFAULT_VALUE,
                                        "MM_EAN_UPC_MARA_EAN11": b1Results?.MM_EAN_UPC_MARA_EAN11?.MM_DEFAULT_VALUE,
                                        "MM_EAN_CATEGORY_MARA_NUMTP": b1Results?.MM_EAN_CATEGORY_MARA_NUMTP?.MM_DEFAULT_VALUE
                                    },
                                    "packagingMatData": {
                                        "MM_MATL_GRP_PACK_MATLS_MARA_MAGRV": b1Results?.MM_MATL_GRP_PACK_MATLS_MARA_MAGRV?.MM_DEFAULT_VALUE,
                                        "MM_REF_MAT_FOR_PCKG_MARA_RMATP": b1Results?.MM_REF_MAT_FOR_PCKG_MARA_RMATP?.MM_DEFAULT_VALUE
                                    },
                                    "advTrackTrace": {
                                        "MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE": b1Results?.MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE?.MM_DEFAULT_VALUE,
                                        "MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF": b1Results?.MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF?.MM_DEFAULT_VALUE,
                                        "MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT": b1Results?.MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT?.MM_DEFAULT_VALUE,
                                        "MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT": b1Results?.MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT?.MM_DEFAULT_VALUE || false,
                                        "MM_LAST_SYNCHRONIZED_MARA_DATS": b1Results?.MM_LAST_SYNCHRONIZED_MARA_DATS?.MM_DEFAULT_VALUE
                                    }
                                }
                                // if (requestSource !== "Repository" && !(requestSource == "Request_Management" && requestType == 3)) {
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/generalData/data`, basicData1Default.generalData);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/shippingData/data`, basicData1Default.shippingData);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/matAuthGroup/data`, basicData1Default.matAuthGroup);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/dimensionsEans/data`, basicData1Default.dimensionsEans);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/packagingMatData/data`, basicData1Default.packagingMatData);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/advTrackTrace/data`, basicData1Default.advTrackTrace);
                                // }
                            }
                            if (b2Results) {
                                //setting basic data 2 defaulting
                                var basicData2Default = {
                                    "otherData": {
                                        "MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH": b2Results?.MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH?.MM_DEFAULT_VALUE,
                                        "MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT": b2Results?.MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT?.MM_DEFAULT_VALUE,
                                        "MM_IND_DESCRIPTION_MARA_NORMT": b2Results?.MM_IND_DESCRIPTION_MARA_NORMT?.MM_DEFAULT_VALUE,
                                        "MM_CAD_INDICATOR_MARA_CADKZ": b2Results?.MM_CAD_INDICATOR_MARA_CADKZ?.MM_DEFAULT_VALUE || false,
                                        "MM_BASIC_MATERIAL_MARA_WRKST": b2Results?.MM_BASIC_MATERIAL_MARA_WRKST?.MM_DEFAULT_VALUE,
                                        "MM_MEDIUM_MARA_MEDIUM": b2Results?.MM_MEDIUM_MARA_MEDIUM?.MM_DEFAULT_VALUE
                                    },
                                    "environment": {
                                        "MM_DG_INDICATOR_PROFILE_MARA_PROFL": b2Results?.MM_DG_INDICATOR_PROFILE_MARA_PROFL?.MM_DEFAULT_VALUE,
                                        "MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW": b2Results?.MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW?.MM_DEFAULT_VALUE || false,
                                        "MM_IN_BULK_LIQUID_MARA_ILOOS": b2Results?.MM_IN_BULK_LIQUID_MARA_ILOOS?.MM_DEFAULT_VALUE || false,
                                        "MM_HIGHLY_VISCOS_MARA_IHIVI": b2Results?.MM_HIGHLY_VISCOS_MARA_IHIVI?.MM_DEFAULT_VALUE || false
                                    },
                                    "designDocAssigned": {
                                        "MM_NO_LINK": b2Results?.MM_NO_LINK?.MM_DEFAULT_VALUE || false
                                    },
                                    "designdrawing": {
                                        "MM_DOCUMENT_MARA_ZEINR": b2Results?.MM_DOCUMENT_MARA_ZEINR?.MM_DEFAULT_VALUE,
                                        "MM_DOCUMENT_TYPE_MARA_ZEIAR": b2Results?.MM_DOCUMENT_TYPE_MARA_ZEIAR?.MM_DEFAULT_VALUE,
                                        "MM_DOCUMENT_VERSION_MARA_ZEIVR": b2Results?.MM_DOCUMENT_VERSION_MARA_ZEIVR?.MM_DEFAULT_VALUE,
                                        "MM_PAGE_NUMBER_MARA_BLATT": b2Results?.MM_PAGE_NUMBER_MARA_BLATT?.MM_DEFAULT_VALUE,
                                        "MM_DOC_CH_NO_MARA_AESZN": b2Results?.MM_DOC_CH_NO_MARA_AESZN?.MM_DEFAULT_VALUE,
                                        "MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO": b2Results?.MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO?.MM_DEFAULT_VALUE,
                                        "MM_NO_SHEETS_MARA_BLANZ": b2Results?.MM_NO_SHEETS_MARA_BLANZ?.MM_DEFAULT_VALUE
                                    },
                                    "clientSpecificConfig": {
                                        "MM_CROSS_PLANT_CM_MARA_SATNR": b2Results?.MM_CROSS_PLANT_CM_MARA_SATNR?.MM_DEFAULT_VALUE,
                                        "MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG": b2Results?.MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG?.MM_DEFAULT_VALUE || false,
                                        "MM_VARIANT": b2Results?.MM_VARIANT?.MM_DEFAULT_VALUE || false
                                    }

                                }
                                //  if (requestSource !== "Repository" && !(requestSource == "Request_Management" && requestType == 3)) {
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/otherData/data`, basicData2Default.otherData);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/environment/data`, basicData2Default.environment);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designDocAssigned/data`, basicData2Default.designDocAssigned);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designdrawing/data`, basicData2Default.designdrawing);
                                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/clientSpecificConfig/data`, basicData2Default.clientSpecificConfig);
                                // }
                            }
                        }
                        let selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                            mappedSystemObject = selectedSystems?.find(systemobj => systemobj.MM_SYSTEM_ID == system),
                            markForSyndicationFlag = mappedSystemObject.markForSyndication;

                        if (wfTaskType == "GMDM_WF_Task" && markForSyndicationFlag) {
                            that.setRequiredBasicdata(b1Results, b2Results, b3Results, b4Results, system);
                        }
                        resolve();
                    }
                    catch (error) {
                        reject(error);
                    }

                });
            },

            setRequiredBasicdata: function (b1Results, b2Results, b3Results, b4Results, system) {
                var MaterialDetails = this.getModelDetails("MaterialDetails");
                if (b1Results) {
                    var requiredBasicData1FieldMapping = {
                        "generalData": {
                            "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS": b1Results?.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS?.MM_MANDATORY || false,
                            "MM_MATERIAL_GROUP_MARA_MATKL": b1Results?.MM_MATERIAL_GROUP_MARA_MATKL?.MM_MANDATORY || false,
                            "MM_OLD_MATERIAL_NUMBER_MARA_BISMT": b1Results?.MM_OLD_MATERIAL_NUMBER_MARA_BISMT?.MM_MANDATORY || false,
                            "MM_DIVISION_MARA_SPART": b1Results?.MM_DIVISION_MARA_SPART?.MM_MANDATORY || false,
                            "MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR": b1Results?.MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR?.MM_MANDATORY || false,
                            "MM_PRODUCT_ALLOCATION_MARA_KOSCH": b1Results?.MM_PRODUCT_ALLOCATION_MARA_KOSCH?.MM_MANDATORY || false,
                            "MM_PRODUCT_HIERARCHY_MARA_PRDHA": b1Results?.MM_PRODUCT_HIERARCHY_MARA_PRDHA?.MM_MANDATORY || false,
                            "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE": b1Results["MM_X-PLANT_MATERIAL_STATUS_MARA_MSTAE"]?.MM_MANDATORY || false,
                            "MM_VALID_FROM_MARA_DATAB": b1Results?.MM_VALID_FROM_MARA_DATAB?.MM_MANDATORY || false,
                            "MM_ASSIGN_EFFECT_VALS_MARA_KZEFF": b1Results?.MM_ASSIGN_EFFECT_VALS_MARA_KZEFF?.MM_MANDATORY || false,
                            "MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA": b1Results?.MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA?.MM_MANDATORY || false,
                            "MM_INDUSTRY_SECTOR_MARA_MBRSH": b1Results?.MM_INDUSTRY_SECTOR_MARA_MBRSH?.MM_MANDATORY || false,
                            "MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG": b1Results?.MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG?.MM_MANDATORY || false
                        },
                        "shippingData": {
                            "MM_TRANSPORTATION_GROUP_MARA_TRAGR": b1Results?.MM_TRANSPORTATION_GROUP_MARA_TRAGR?.MM_MANDATORY || false
                        },
                        "matAuthGroup": {
                            "MM_AUTHORIZATION_GROUP_MARA_BEGRU": b1Results?.MM_AUTHORIZATION_GROUP_MARA_BEGRU?.MM_MANDATORY || false
                        },
                        "dimensionsEans": {
                            "MM_GROSS_WEIGHT_MARA_BRGEW": b1Results?.MM_GROSS_WEIGHT_MARA_BRGEW?.MM_MANDATORY || false,
                            "MM_WEIGHT_UNIT_MARM_GEWEI": b1Results?.MM_WEIGHT_UNIT_MARM_GEWEI?.MM_MANDATORY || false,
                            "MM_NET_WEIGHT_MARA_NTGEW": b1Results?.MM_NET_WEIGHT_MARA_NTGEW?.MM_MANDATORY || false,
                            "MM_VOLUME_MARM_VOLUM": b1Results?.MM_VOLUME_MARM_VOLUM?.MM_MANDATORY || false,
                            "MM_VOLUME_UNIT_MARM_VOLEH": b1Results?.MM_VOLUME_UNIT_MARM_VOLEH?.MM_MANDATORY || false,
                            "MM_SIZE_DIMENSIONS_MARA_GROES": b1Results?.MM_SIZE_DIMENSIONS_MARA_GROES?.MM_MANDATORY || false,
                            "MM_EAN_UPC_MARA_EAN11": b1Results?.MM_EAN_UPC_MARA_EAN11?.MM_MANDATORY || false,
                            "MM_EAN_CATEGORY_MARA_NUMTP": b1Results?.MM_EAN_CATEGORY_MARA_NUMTP?.MM_MANDATORY || false
                        },
                        "packagingMatData": {
                            "MM_MATL_GRP_PACK_MATLS_MARA_MAGRV": b1Results?.MM_MATL_GRP_PACK_MATLS_MARA_MAGRV?.MM_MANDATORY || false,
                            "MM_REF_MAT_FOR_PCKG_MARA_RMATP": b1Results?.MM_REF_MAT_FOR_PCKG_MARA_RMATP?.MM_MANDATORY || false
                        },
                        "advTrackTrace": {
                            "MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE": b1Results?.MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE?.MM_MANDATORY || false,
                            "MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF": b1Results?.MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF?.MM_MANDATORY || false,
                            "MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT": b1Results?.MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT?.MM_MANDATORY || false,
                            "MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT": b1Results?.MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT?.MM_MANDATORY || false,
                            "MM_LAST_SYNCHRONIZED_MARA_DATS": b1Results?.MM_LAST_SYNCHRONIZED_MARA_DATS?.MM_MANDATORY || false
                        }
                    };
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/generalData/required`, requiredBasicData1FieldMapping.generalData);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/shippingData/required`, requiredBasicData1FieldMapping?.shippingData);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/matAuthGroup/required`, requiredBasicData1FieldMapping.matAuthGroup);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/dimensionsEans/required`, requiredBasicData1FieldMapping.dimensionsEans);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/packagingMatData/required`, requiredBasicData1FieldMapping.packagingMatData);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/advTrackTrace/required`, requiredBasicData1FieldMapping.advTrackTrace);
                }
                if (b2Results) {
                    var requiredBasicData2FieldMapping = {
                        "otherData": {
                            "MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH": b2Results?.MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH?.MM_MANDATORY || false,
                            "MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT": b2Results?.MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT?.MM_MANDATORY || false,
                            "MM_IND_DESCRIPTION_MARA_NORMT": b2Results?.MM_IND_DESCRIPTION_MARA_NORMT?.MM_MANDATORY || false,
                            "MM_CAD_INDICATOR_MARA_CADKZ": b2Results?.MM_CAD_INDICATOR_MARA_CADKZ?.MM_MANDATORY || false,
                            "MM_BASIC_MATERIAL_MARA_WRKST": b2Results?.MM_BASIC_MATERIAL_MARA_WRKST?.MM_MANDATORY || false,
                            "MM_MEDIUM_MARA_MEDIUM": b2Results?.MM_MEDIUM_MARA_MEDIUM?.MM_MANDATORY || false
                        },
                        "environment": {
                            "MM_DG_INDICATOR_PROFILE_MARA_PROFL": b2Results?.MM_DG_INDICATOR_PROFILE_MARA_PROFL?.MM_MANDATORY || false,
                            "MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW": b2Results?.MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW?.MM_MANDATORY || false,
                            "MM_IN_BULK_LIQUID_MARA_ILOOS": b2Results?.MM_IN_BULK_LIQUID_MARA_ILOOS?.MM_MANDATORY || false,
                            "MM_HIGHLY_VISCOS_MARA_IHIVI": b2Results?.MM_HIGHLY_VISCOS_MARA_IHIVI?.MM_MANDATORY || false
                        },
                        "designDocAssigned": {
                            "MM_NO_LINK": b2Results?.MM_NO_LINK?.MM_MANDATORY || false
                        },
                        "designdrawing": {
                            "MM_DOCUMENT_MARA_ZEINR": b2Results?.MM_DOCUMENT_MARA_ZEINR?.MM_MANDATORY || false,
                            "MM_DOCUMENT_TYPE_MARA_ZEIAR": b2Results?.MM_DOCUMENT_TYPE_MARA_ZEIAR?.MM_MANDATORY || false,
                            "MM_DOCUMENT_VERSION_MARA_ZEIVR": b2Results?.MM_DOCUMENT_VERSION_MARA_ZEIVR?.MM_MANDATORY || false,
                            "MM_PAGE_NUMBER_MARA_BLATT": b2Results?.MM_PAGE_NUMBER_MARA_BLATT?.MM_MANDATORY || false,
                            "MM_DOC_CH_NO_MARA_AESZN": b2Results?.MM_DOC_CH_NO_MARA_AESZN?.MM_MANDATORY || false,
                            "MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO": b2Results?.MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO?.MM_MANDATORY || false,
                            "MM_NO_SHEETS_MARA_BLANZ": b2Results?.MM_NO_SHEETS_MARA_BLANZ?.MM_MANDATORY || false
                        },
                        "clientSpecificConfig": {
                            "MM_CROSS_PLANT_CM_MARA_SATNR": b2Results?.MM_CROSS_PLANT_CM_MARA_SATNR?.MM_MANDATORY || false,
                            "MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG": b2Results?.MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG?.MM_MANDATORY || false,
                            "MM_VARIANT": b2Results?.MM_VARIANT?.MM_MANDATORY || false
                        }

                    };
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/otherData/required`, requiredBasicData2FieldMapping.otherData);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/environment/required`, requiredBasicData2FieldMapping.environment);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designDocAssigned/required`, requiredBasicData2FieldMapping.designDocAssigned);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designdrawing/required`, requiredBasicData2FieldMapping.designdrawing);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/clientSpecificConfig/required`, requiredBasicData2FieldMapping.clientSpecificConfig);
                }
                if (b3Results) {
                    let descMandatory = (b3Results?.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX?.MM_MANDATORY === "Yes") ? true : false,
                        descMandatoryLanguage = b3Results?.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX?.MM_ATTRIBUTE_LANGUAGE;
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/descriptionData/descMandatory`, descMandatory);
                    if (descMandatory) {
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/descriptionData/descMandatoryLanguage`, descMandatoryLanguage);
                    }
                }
                if (b4Results) {
                    let basicTextMandatory = (b4Results?.MM_MATERIAL_LONG_DESC_STXH_TDNAME?.MM_MANDATORY === "Yes" ? true : false),
                        basicTextMandatoryLanguage = b4Results?.MM_MATERIAL_LONG_DESC_STXH_TDNAME?.MM_ATTRIBUTE_LANGUAGE;
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/basicDataText/basicTextMandatory`, basicTextMandatory);
                    if (basicTextMandatory) {
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/basicDataText/basicTextMandatoryLanguage`, basicTextMandatoryLanguage);
                    }
                }
            },

            fnToValidateEachField: function (tabData, tabName) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    i18nModel = this.getModelDetails("i18n"),
                    oResourceBundle = i18nModel.getResourceBundle(),
                    attributeListProdData = LookupModel.getProperty("/attributeListProdData"),
                    isValid = true;
                if (!missingMandatoryFields) {
                    missingMandatoryFields = [];
                }
                for (let section in tabData) {
                    let mandatoryFieldsList = tabData[section]["MM_MANDATORY"],
                        visibleFieldsList = tabData[section]["MM_VISIBILITY"],
                        fieldValueList = tabData[section]["data"],
                        field_OtherList = tabData[section]["MM_LOOKUP_OTHER_VALUE_OPTION"],
                        fieldDataType = tabData[section]["MM_UI_FIELD_TYPE"];
                    for (let fields in mandatoryFieldsList) {
                        let valueStatePath = null,
                            otherFieldExist = field_OtherList[fields] === true;
                        let fieldName = oResourceBundle.getText(attributeListProdData?.find(item => item?.attribute === fields)?.attribute_value),
                            value = fieldValueList[fields];
                        if (otherFieldExist) {
                            let corresponding_field = fields + "_Other",
                                // fieldName_Text = oResourceBundle.getText(corresponding_field),
                                fieldName_Text = oResourceBundle.getText(attributeListProdData?.find(item => item?.attribute === fields)?.attribute_value) + " Other",
                                isFieldValid = true,
                                cfValue = fieldValueList[corresponding_field],
                                valueState = "None";
                            //check whether the respective field value is Other
                            if ((value === "other" || value?.toString()?.includes("other")) && (cfValue === null || cfValue === undefined || cfValue === "")) {
                                valueState = "Error";
                                isFieldValid = false;
                            }
                            valueStatePath = "/" + tabName + "/" + section + "/valueState/" + corresponding_field;
                            MaterialDetails.setProperty(valueStatePath, valueState);
                            if (isFieldValid === false) {
                                isValid = false;
                                missingMandatoryFields.push({
                                    "tabName": oResourceBundle.getText(tabName),
                                    "fieldName": fieldName_Text
                                });
                            }
                        }
                        if (mandatoryFieldsList[fields] === true && visibleFieldsList[fields] === true) {
                            if (!fields.includes("_Other")) {
                                let isFieldValid = true,
                                    valueState = "None";
                                switch (fieldDataType[fields]) {
                                    case "InputText":
                                        if (value === null || value === undefined || value === "") {
                                            valueState = "Error";
                                            isFieldValid = false;
                                        }
                                        break;
                                    case "InputSearch":
                                        if (value === null || value === undefined || value === "") {
                                            valueState = "Error";
                                            isFieldValid = false;
                                        }
                                        break;
                                    case "TextArea":
                                        if (value === null || value === undefined || value === "") {
                                            valueState = "Error";
                                            isFieldValid = false;
                                        }
                                        break;
                                    case "Dropdown":
                                        value = fieldValueList[fields];
                                        if (value === null || value === undefined || value === "") {
                                            valueState = "Error";
                                            isFieldValid = false;
                                        }
                                        break;
                                    case "MultiComboBox":
                                        value = fieldValueList[fields];
                                        if (value === null || value === undefined || value === "" || value.length === 0) {
                                            valueState = "Error";
                                            isFieldValid = false;
                                        }
                                        break;
                                    case "date":
                                        if (value === null || value === undefined || value === "") {
                                            valueState = "Error";
                                            isFieldValid = false;
                                        }
                                        break;
                                    case "Tree":
                                        if (value === null || value === undefined || value === "") {
                                            valueState = "Error";
                                            isFieldValid = false;
                                        }
                                        break;
                                }
                                valueStatePath = "/" + tabName + "/" + section + "/valueState/" + fields;
                                MaterialDetails.setProperty(valueStatePath, valueState);
                                if (isFieldValid === false) {
                                    isValid = false;
                                    missingMandatoryFields.push({
                                        "tabName": oResourceBundle.getText(tabName),
                                        "fieldName": fieldName
                                    });
                                }
                            }
                        }
                    }
                }
                MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", missingMandatoryFields);
                return isValid;
                // });
            },

            fnToValidateOrgData: function (tabData) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    plantRefList = LookupModel.getProperty("/MM_PLANT_REF_LIST"),
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    isValidOrgData = false,
                    missingProfitCenters = [];
                missingProfitCenters = tabData.filter(plant => (plant.isIncluded && !(plant.profitCenterId))).map(filteredPlant => formatter.getPlantIdCode(filteredPlant.MM_PLANT_ID, plantRefList));
                if (missingProfitCenters && missingProfitCenters.length == 0) {
                    isValidOrgData = true;
                }
                else {
                    let sOrgDataErrorMsg = this.geti18nText("msgOrgDataProfitCenterisMan") + " [" + missingProfitCenters + "]";
                    missingMandatoryFields.push({
                        "tabName": this.geti18nText("Org_Data"),
                        "fieldName": sOrgDataErrorMsg
                    });
                }

                return isValidOrgData;
            },

            fnToValidateBasicData1: function (system, tabData, tabName) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    i18nModel = this.getModelDetails("i18n"),
                    basicData1 = tabData,
                    oResourceBundle = i18nModel.getResourceBundle(),
                    isValidated = true,
                    path,
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    requiredFieldsBasicData1 = {
                        "generalData": basicData1?.generalData?.required,
                        "matAuthGroup": basicData1?.matAuthGroup?.required,
                        "dimensionsEans": basicData1?.dimensionsEans?.required,
                        "packagingMatData": basicData1?.packagingMatData?.required,
                        "advTrackTrace": basicData1?.advTrackTrace?.required
                    },
                    systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    systemText = null;

                try {
                    let mappedObj = systemLookup.find(obj =>
                        obj.MM_KEY == system
                    );
                    systemText = mappedObj.MM_SYSTEM_REF_LIST_CODE || null;
                }
                catch (e) {

                }
                if (!missingMandatoryFields) {
                    missingMandatoryFields = [];
                }
                for (let item in requiredFieldsBasicData1) {
                    for (let field in requiredFieldsBasicData1[item]) {
                        path = "/AggregatedSystemDetails/" + system + "/" + tabName + "/" + item + "/valueState/" + field;
                        if ((requiredFieldsBasicData1[item][field] === true || requiredFieldsBasicData1[item][field] === "yes" || requiredFieldsBasicData1[item][field] === "Yes") && (basicData1[item]["data"][field] === "" || basicData1[item]["data"][field] === null || basicData1[item]["data"][field] === undefined)) {
                            isValidated = false;
                            MaterialDetails.setProperty(path, "Error");
                            missingMandatoryFields.push({
                                "tabName": systemText + " - " + oResourceBundle.getText(tabName),
                                "fieldName": oResourceBundle.getText(field)
                            });
                        }
                        else {
                            MaterialDetails.setProperty(path, "None");
                        }
                    }
                }
                MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", missingMandatoryFields);
                return isValidated;
            },

            fnToValidateBasicData2: function (system, tabData, tabName) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    i18nModel = this.getModelDetails("i18n"),
                    basicData2 = tabData,
                    oResourceBundle = i18nModel.getResourceBundle(),
                    isValidated = true,
                    path,
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    requiredFieldsBasicData2 = {
                        "otherData": basicData2?.otherData?.required,
                        "environment": basicData2?.environment?.required,
                        "designDocAssigned": basicData2?.designDocAssigned?.required,
                        "designdrawing": basicData2?.designdrawing?.required,
                        "clientSpecificConfig": basicData2?.clientSpecificConfig?.required
                    },
                    systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    systemText = null;

                try {
                    let mappedObj = systemLookup.find(obj =>
                        obj.MM_KEY == system
                    );
                    systemText = mappedObj.MM_SYSTEM_REF_LIST_CODE || null;
                }
                catch (e) {

                }
                if (!missingMandatoryFields) {
                    missingMandatoryFields = [];
                }
                for (let item in requiredFieldsBasicData2) {
                    for (let field in requiredFieldsBasicData2[item]) {
                        path = "/AggregatedSystemDetails/" + system + "/" + tabName + "/" + item + "/valueState/" + field;
                        if ((requiredFieldsBasicData2[item][field] === true || requiredFieldsBasicData2[item][field] === "yes" || requiredFieldsBasicData2[item][field] === "Yes") && (basicData2[item]["data"][field] === "" || basicData2[item]["data"][field] === null || basicData2[item]["data"][field] === undefined)) {
                            isValidated = false;
                            MaterialDetails.setProperty(path, "Error");
                            missingMandatoryFields.push({
                                "tabName": systemText + " - " + oResourceBundle.getText(tabName),
                                "fieldName": oResourceBundle.getText(field)
                            });
                        }
                        else {
                            MaterialDetails.setProperty(path, "None");
                        }
                    }
                }
                MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", missingMandatoryFields);
                return isValidated;
            },

            fnToValidateAdditionalTabField: function (system, tabData, altUomData) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    isValidDesc = true, isValidBasicData = true, isValidAltUom = true,
                    reqTypeID = CreateProject.getProperty("/RequestHeader/data/requestType");


                if (reqTypeID == 1 || reqTypeID == 6) {
                    //DESCRIPTION
                    isValidDesc = this.fnToValidateDescription(system, tabData);
                    //BASICDATA TEXT
                    isValidBasicData = this.fnToValidateBasicDataText(system, tabData);
                }
                //AltUom
                isValidAltUom = this.fnToValidateAltUom(system, altUomData);
                return isValidDesc && isValidBasicData && isValidAltUom;
            },

            fnToValidateDescription: function (system, tabData) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    aDescData = tabData.descriptionData.data,
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    isValidDesc = false,
                    missingDescLanguages = [],
                    additionalDataDescMandLang = tabData?.descriptionData?.descMandatoryLanguage || [],
                    systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    systemText = null;

                try {
                    let mappedObj = systemLookup.find(obj =>
                        obj.MM_KEY == system
                    );
                    systemText = mappedObj.MM_SYSTEM_REF_LIST_CODE || null;
                }
                catch (e) {

                }

                // To find , the missing mandatory languages in the Description
                if (additionalDataDescMandLang && additionalDataDescMandLang.length) {
                    missingDescLanguages = additionalDataDescMandLang.filter(lang =>
                        !aDescData.some(data => data.MM_LANGUAGE === lang)
                    );
                }
                // If can't find any missing mandatory language, setting corresponding isValid "true"   
                if (missingDescLanguages && missingDescLanguages.length == 0) {
                    isValidDesc = true; // Material Description Tab
                }
                if (!isValidDesc) {
                    let sDescErrorMsg = this.geti18nText("msgAdditionalDataTabMaterialDesc") + " [" + missingDescLanguages + "]";
                    missingMandatoryFields.push({
                        "tabName": systemText + " - " + this.geti18nText("additionalData"),
                        "fieldName": sDescErrorMsg
                    });
                }

                MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", missingMandatoryFields);

                return isValidDesc;
            },

            fnToValidateBasicDataText: function (system, tabData) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    aBasicTextData = tabData.basicDataText.data,
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    isValidBasicData = false,
                    missingBasicTextLanguages = [],
                    basicTextMandatoryLanguage = tabData?.basicDataText?.basicTextMandatoryLanguage || [],
                    systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    systemText = null;

                try {
                    let mappedObj = systemLookup.find(obj =>
                        obj.MM_KEY == system
                    );
                    systemText = mappedObj.MM_SYSTEM_REF_LIST_CODE || null;
                }
                catch (e) {

                }

                // To find , the missing mandatory languages in the Basic Data Text
                if (basicTextMandatoryLanguage.length) {
                    missingBasicTextLanguages = basicTextMandatoryLanguage.filter(lang =>
                        !aBasicTextData.some(data => data.MM_LANGUAGE === lang)
                    );
                }

                if (missingBasicTextLanguages && missingBasicTextLanguages.length == 0) {
                    isValidBasicData = true; // Basic Data Text Tab
                }
                if (!isValidBasicData) {
                    let sBasicDataErrorMsg = this.geti18nText("msgAdditionalDataTabBasicDataText") + " [" + missingBasicTextLanguages + "]";
                    missingMandatoryFields.push({
                        "tabName": systemText + " - " + this.geti18nText("additionalData"),
                        "fieldName": sBasicDataErrorMsg
                    });
                }
                MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", missingMandatoryFields);

                return isValidBasicData;
            },

            fnToValidateGrossWtNetWt: function (system, data) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    systemText = null,
                    i18nModel = this.getModelDetails("i18n"),
                    oResourceBundle = i18nModel.getResourceBundle(),
                    grossWt = data.MM_GROSS_WEIGHT_MARA_BRGEW,
                    netWt = data.MM_NET_WEIGHT_MARA_NTGEW,
                    defaultGrossWt = MaterialDetails.getProperty(`/SystemPropertyDetails/${system}/Basic_Data_1/MM_GROSS_WEIGHT_MARA_BRGEW/MM_DEFAULT_VALUE`),
                    defaultNetWt = MaterialDetails.getProperty(`/SystemPropertyDetails/${system}/Basic_Data_1/MM_NET_WEIGHT_MARA_NTGEW/MM_DEFAULT_VALUE`);

                if (netWt === defaultNetWt && grossWt === defaultGrossWt) {
                    return true;
                }

                try {
                    let mappedObj = systemLookup.find(obj =>
                        obj.MM_KEY == system
                    );
                    systemText = mappedObj.MM_SYSTEM_REF_LIST_CODE || null;
                }
                catch (e) {

                }

                if (!missingMandatoryFields) {
                    missingMandatoryFields = [];
                }

                if (data.MM_NET_WEIGHT_MARA_NTGEW > data.MM_GROSS_WEIGHT_MARA_BRGEW) {
                    missingMandatoryFields.push({
                        "tabName": systemText + " - " + oResourceBundle.getText("basicData1"),
                        "fieldName": oResourceBundle.getText("netWtGrossWtError")
                    });
                }

                var oAppModel = this.getModelDetails("oAppModel"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType");

                //TODO: check for all flows
                if (wfTaskType === "GMDM_WF_Task" && data.MM_NET_WEIGHT_MARA_NTGEW > data.MM_GROSS_WEIGHT_MARA_BRGEW) {
                    MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", missingMandatoryFields);
                    return false;
                }


                return true;
            },

            fnToValidateAltUom: function (system, altUomData) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    aAltUomData = altUomData?.UOMData,
                    missingMandatoryFields = MaterialDetails.getProperty("/GeneralData/missingMandatoryFields"),
                    isValidAltUom = true,
                    systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    systemText = null,
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    s_WF_Requestor = "Request_Form_Submission",
                    s_WF_Rework = "Requester_Rework_WF_Task",
                    s_WF_GMDM = "GMDM_WF_Task",
                    requiredFields = [];

                if (currentView == "CreateProject" && (wfTaskType == s_WF_Requestor || wfTaskType == s_WF_Rework)) {
                    requiredFields = [
                        {
                            "fieldPath": "MM_ALTERNATE_UNIT_MARM_MEINH",
                            "i18Text": "MM_ALTERNATE_UNIT_MARM_MEINH"
                        },
                        {
                            "fieldPath": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS",
                            "i18Text": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS"
                        }
                    ]
                } else if ((currentView == "CreateProject" && wfTaskType == s_WF_GMDM) || currentView == "Repository") {
                    requiredFields = [
                        {
                            "fieldPath": "MM_ALTERNATE_UNIT_MARM_MEINH",
                            "i18Text": "MM_ALTERNATE_UNIT_MARM_MEINH"
                        },
                        {
                            "fieldPath": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS",
                            "i18Text": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS"
                        },
                        {
                            "fieldPath": "MM_WEIGHT_UNIT_MARM_GEWEI",
                            "i18Text": "MM_WEIGHT_UNIT_MARM_GEWEI"
                        }
                    ]
                }

                try {
                    let mappedObj = systemLookup.find(obj =>
                        obj.MM_KEY == system
                    );
                    systemText = mappedObj.MM_SYSTEM_REF_LIST_CODE || null;
                }
                catch (e) {

                }
                aAltUomData?.map(item => {
                    requiredFields?.map(itemA => {
                        if (!item[itemA?.fieldPath]) {
                            isValidAltUom = false;
                            missingMandatoryFields.push({
                                "tabName": systemText + " - " + this.geti18nText("additionalData"),
                                "fieldName": this.geti18nText("AdditionalUOM") + " - " + this.geti18nText(itemA?.i18Text)
                            });
                        }
                    })
                });

                MaterialDetails.setProperty("/GeneralData/missingMandatoryFields", missingMandatoryFields);

                return isValidAltUom;

            },

            onConfirmMandatoryMissingFields: function () {
                this.byId("id_MD_MissingMandatoryField").close();
            },

            handleEditabilityforProductData: function (viewSource, materialListId = null) {
                return new Promise((resolve) => {
                    var that = this,
                        LookupModel = this.getModelDetails("LookupModel"),
                        CreateProject = this.getModelDetails("CreateProject"),
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        LookupModel = this.getModelDetails("LookupModel"),
                        Repository = this.getModelDetails("Repository"),
                        oAppModel = this.getModelDetails("oAppModel"),
                        wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                        currentUserRole = oAppModel.getProperty("/userdetails/userRole"),
                        isUserRequestOwner = CreateProject.getProperty("/GeneralData/isUserRequestOwner"),
                        productDataFields = null,
                        productDataFieldLayoutPayload = {},
                        materialType = null,
                        requestType = null,
                        requestNo = null,
                        materialNumber = null,
                        applicableIn = null,
                        requestSource = null,
                        tabName = null;
                    if (viewSource === "CreateProject") {
                        materialType = this.fnGetRequestHeaderData("materialType");
                        requestType = this.fnGetRequestHeaderData("requestType");
                        materialNumber = this.fnGetMaterialDetailsSelectedData("materialNumber") || null,
                            requestNo = this.fnGetRequestHeaderData("requestNumber");
                        applicableIn = "Request";
                        requestSource = "Request_Management";
                        tabName = CreateProject.getProperty("/RequestHeader/data/uiView");
                    }
                    else if ("Repository") {
                        materialNumber = Repository.getProperty("/MaterialSelected/materialNumber");
                        materialType = Repository.getProperty("/MaterialSelected/materialTypeId");
                        requestType = 3; // By default Modify scenario
                        applicableIn = "Repository";
                        requestSource = "Repository";
                        tabName = Repository.getProperty("/MaterialSelected/editBtnClicked");
                        if(!materialNumber){
                            return;
                        }
                    }
                    productDataFieldLayoutPayload = {
                        "applicableIn": applicableIn,
                        "materialTypeId": parseInt(materialType) || null,
                        "requestTypeId": parseInt(requestType) || null,
                        "requestNumber": parseInt(requestNo) || null,
                        "materialNumber": parseInt(materialNumber) || null,
                        "materialListId": materialListId,
                        "uiView": "Product_Data",
                        "requestSource": requestSource,
                        "wfTaskType": wfTaskType
                    };
                    this.fnProcessDataRequest("MM_JAVA/getFieldLayout", "POST", null, true, productDataFieldLayoutPayload,
                        function (responseData) {
                            let productDataFields = responseData?.responseDto;
                            for (let keyIndex in productDataFields) {
                                for (let field of productDataFields[keyIndex]) {
                                    if (keyIndex === "Alternate_ID_Table") {
                                        let fieldList = productDataFields[keyIndex];
                                        fieldList.map(function (field) {
                                            if (field.MM_ATTRIBUTE_ID === "MM_ALTERNATE_ID_TYPE") {
                                                // if((currentUserRole == "repoViewOnly" && field && viewSource === "Repository") || (!isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewSource === "CreateProject")){
                                                //     field.MM_EDITABLE = "No"
                                                // }
                                                if ((!isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewSource === "CreateProject")) {
                                                    field.MM_EDITABLE = "No"
                                                }
                                                let isAltIDEditable = field.MM_EDITABLE === "Yes" ? true : false;
                                                MaterialDetails.setProperty("/ProductDataStatic/alternateID/alternateIDBtns/visible", isAltIDEditable);
                                            }
                                        })
                                    }
                                    else {
                                        // if((currentUserRole == "repoViewOnly" && field && viewSource === "Repository") || (!isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewSource === "CreateProject")){
                                        //     field.MM_EDITABLE = "No"
                                        // }
                                        if ((!isUserRequestOwner && wfTaskType === "Request_Form_Submission" && viewSource === "CreateProject")) {
                                            field.MM_EDITABLE = "No"
                                        }
                                        MaterialDetails.setProperty(`/ProductData/${keyIndex}/MM_EDITABLE/${field?.MM_ATTRIBUTE_ID}`, field?.MM_EDITABLE === "Yes" ? true : false);
                                        MaterialDetails.setProperty(`/ProductData/${keyIndex}/MM_MANDATORY/${field?.MM_ATTRIBUTE_ID}`, field?.MM_MANDATORY === "Yes" ? true : false);
                                    }
                                }
                            }
                            that.closeBusyDialog();
                            resolve(true);
                        },
                        function (error) {
                            that.closeBusyDialog();
                            resolve(true);
                        }
                    );
                })
            },

            fnAfterRenderProductDataView: function (productDataFields, viewName) {
                return new Promise((resolve) => {
                    let that = this,
                        CreateProject = that.getModelDetails("CreateProject"),
                        materialType,
                        Repository = that.getModelDetails("Repository"),
                        MaterialDetails = this.getModelDetails("MaterialDetails");
                    that.fnToRenderProductDataView(productDataFields).then(async function ([productDataOutline, combobox_Fields, Tree_Fields]) {
                        if (viewName === "CreateProject") {  //Storing the Template directly the Rules Outline
                            CreateProject.setProperty("/productDataOutline", productDataOutline);
                            materialType = CreateProject.getProperty("/RequestHeader/data/materialType");
                        }
                        if (viewName === "Repository") {  //Storing the Template directly the Rules Outline
                            materialType = Repository.getProperty("/MaterialSelected/materialTypeId");
                            Repository.setProperty(`/ProductData/productDataOutline`, productDataOutline);
                        }
                        // if (Tree_Fields) {
                        //     await that.loadTreeStructure(Tree_Fields);
                        // }
                        if (combobox_Fields) {
                            that.loadDropdownValuesDynamicUI(combobox_Fields, materialType);
                        }
                        if (Tree_Fields) {
                            let treeData = MaterialDetails.getProperty(`/ProductDataStatic/TreeData`);
                            if (!treeData) {
                                MaterialDetails.setProperty("/ProductDataStatic/TreeData", {});
                                MaterialDetails.setProperty("/ProductDataStatic/TreeData/TreeField_Objects", Tree_Fields);
                            }
                            else {
                                MaterialDetails.setProperty("/ProductDataStatic/TreeData/TreeField_Objects", Tree_Fields);
                            }
                        }
                        resolve(true);
                    });
                });
            },

            onLoadOtherFieldsDynamically: function (selectedPath) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    P_Data = null,
                    fieldName = null,
                    V_Data = null,
                    P_OtherData = null,
                    P_Other_Field = null,
                    V_Other_Field = null,
                    P_Visible = null,
                    P_Class = null;
                try {
                    P_Data = selectedPath;
                    let modelProperty = P_Data.split("/");
                    if (modelProperty) {
                        fieldName = modelProperty[modelProperty.length - 1];
                        P_Class = "/" + modelProperty[1] + "/" + modelProperty[2] + "/";
                        P_Visible = P_Class + "MM_VISIBILITY/" + fieldName + "_Other";
                        P_OtherData = P_Class + "data/" + fieldName + "_Other";
                        P_Other_Field = P_Class + "MM_LOOKUP_OTHER_VALUE_OPTION/" + fieldName;
                        V_Other_Field = MaterialDetails.getProperty(P_Other_Field); // ture /false
                        V_Data = MaterialDetails.getProperty(P_Data);
                    }
                    if (V_Other_Field === true && (V_Data === "other" || V_Data?.toString()?.includes("other"))) {
                        MaterialDetails.setProperty(P_Visible, true);
                    }
                    else {
                        MaterialDetails.setProperty(P_OtherData, null);
                        MaterialDetails.setProperty(P_Visible, false);
                    }
                }
                catch (e) { }
            },

            loadDropdownValuesDynamicUI: function (combobox_Fields, materialType) {
                materialType = parseInt(materialType);
                var lookupModel = this.getModelDetails("LookupModel"),
                    that = this;
                combobox_Fields.map(function (fieldObj) {
                    var sPath = "/" + fieldObj.fieldName,
                        MM_LookUpRuleName = fieldObj.MM_LOOKUP_RULE_NAME,
                        FIELD_TYPE = fieldObj.FIELD_TYPE,
                        dropdownDataExists = lookupModel.getProperty(sPath);
                    if (MM_LookUpRuleName && (!(MM_LookUpRuleName.match("\"\"")))) {  // to check whether rule name is added in the rule or not
                        if (!dropdownDataExists || MM_LookUpRuleName == "MM_BASE_UOM_RULE") {
                            if (FIELD_TYPE === "Tree") {
                                // let payload = {
                                //     "refRuleName": MM_LookUpRuleName
                                // }
                                // that.fnProcessDataRequest("MM_JAVA/getTreeStructureAndHashMap", "POST", null, false, payload,
                                //     async function (responseData) {
                                //         lookupModel.setProperty(sPath, responseData);//Other Fields will not exists for tree structure.
                                //     },
                                //     function (error) { },
                                // )
                            }
                            else {
                                let conditions = [{
                                    "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": "*"
                                }],
                                    sysOrderDescCol = MM_LookUpRuleName + "." + MM_LookUpRuleName + "_DESC",
                                    systemOrders = {
                                        [sysOrderDescCol]: "ASC"
                                    },
                                    systemFilters = [{
                                        "column": `${MM_LookUpRuleName}.MM_ACTIVE`,
                                        "operator": "like",
                                        "value": "%Yes%"
                                    }],
                                    payload,
                                    data = [];
                                if (MM_LookUpRuleName == "MM_BASE_UOM_RULE") {
                                    systemFilters = [
                                        {
                                            "column": "MM_BASE_UOM_RULE.MM_MATERIAL_TYPE",
                                            "operator": "equal",
                                            "value": materialType
                                        },
                                        {
                                            "column": "MM_BASE_UOM_RULE.MM_TARGET_SYSTEM_ID",
                                            "operator": "is null",
                                            "value": null
                                        }
                                    ];
                                    systemOrders = null;
                                }
                                payload = that.onGetRulePayload(MM_LookUpRuleName, conditions, systemOrders, systemFilters);
                                that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                                    async function (responseData) {
                                        if (MM_LookUpRuleName == "MM_BASE_UOM_RULE") {
                                            data = that.fnToMapProductDataBaseUomValues(responseData?.data?.result[0][MM_LookUpRuleName]);
                                        } else {
                                            data = responseData?.data?.result[0][MM_LookUpRuleName] || [];
                                        }
                                        that.setOtherValueinLookup(data, fieldObj);
                                    },
                                    function (error) { },
                                );
                            }

                        }
                        else {
                            that.setOtherValueinLookup(dropdownDataExists, fieldObj);
                        }
                    }
                });
            },

            fnToMapProductDataBaseUomValues: function (data) {
                var lookupModel = this.getModelDetails("LookupModel"),
                    listOfBaseUoms = lookupModel.getProperty("/MM_UOM_REF_LIST"),
                    mappedBaseUom;
                mappedBaseUom = data?.map(itemA =>
                    listOfBaseUoms?.find(itemB => parseInt(itemB.MM_KEY) === parseInt(itemA.MM_BASE_UOM_ID))
                );
                mappedBaseUom = mappedBaseUom?.map(item => ({
                    MM_BASE_UOM_RULE_DESC: item?.MM_UOM_REF_LIST_DESC,
                    MM_BASE_UOM_RULE_CODE: item?.MM_UOM_REF_LIST_CODE,
                    MM_KEY: item?.MM_KEY,
                    MM_ACTIVE: item?.MM_ACTIVE
                }));
                return mappedBaseUom || [];

            },

            // loadTreeStructure: function (Tree_Fields) {
            //     return new Promise((res) => {
            //         var lookupModel = this.getModelDetails("LookupModel"),
            //             that = this,
            //             promiseArray = [];
            //         Tree_Fields.map(async function (fieldObj) {
            //             var sPath = "/" + fieldObj.fieldName,
            //                 MM_LookUpRuleName = fieldObj.MM_LOOKUP_RULE_NAME,
            //                 dropdownDataExists = lookupModel.getProperty(sPath);
            //             if (MM_LookUpRuleName && (!(MM_LookUpRuleName.match("\"\"")))) {  // to check whether rule name is added in the rule or not
            //                 if (!dropdownDataExists) {
            //                     let payload = {
            //                         "refRuleName": MM_LookUpRuleName
            //                     }
            //                     const helPerFunction = () => {
            //                         var a = new Promise((resolve) => {
            //                             that.fnProcessDataRequest("MM_JAVA/getTreeStructureAndHashMap", "POST", null, false, payload,
            //                                 function (responseData) {
            //                                     lookupModel.setProperty(sPath, responseData);//Other Fields will not exists for tree structure.
            //                                     resolve(true);
            //                                 },
            //                                 function (error) {
            //                                     resolve(true);
            //                                 },
            //                             )
            //                         })
            //                         promiseArray.push(a);
            //                     }
            //                     helPerFunction();
            //                 }
            //             }
            //         });
            //         Promise.all(promiseArray).then(() => {
            //             res(true);
            //         }).catch(error => {
            //             console.log("An Error Occured!")
            //         });

            //     })
            // },

            setOtherValueinLookup: function (data, fieldObj) {
                let checkForOtherOption = function () {
                    let key = "MM_KEY";
                    return data?.findIndex(element => element[key] == "other");
                };
                let lookupModel = this.getModelDetails("LookupModel"),
                    sPath = "/" + fieldObj.fieldName,
                    MM_Lookup_Other_Option = fieldObj.MM_Lookup_Other_Option,
                    MM_LookUpRuleName = fieldObj.MM_LOOKUP_RULE_NAME,
                    otherOptionIndex = checkForOtherOption();
                if (MM_Lookup_Other_Option == true) {
                    if (otherOptionIndex === -1) {  //Other Key is not present in the list
                        let codeProperty = MM_LookUpRuleName + "_CODE",
                            keyProperty = "MM_KEY",
                            descProperty = MM_LookUpRuleName + "_DESC",
                            other_LookUp = {};
                        other_LookUp[keyProperty] = "other";
                        other_LookUp[codeProperty] = "Other";
                        other_LookUp[descProperty] = "OTHER";
                        if (data) {
                            data.push(other_LookUp);
                        }
                    }
                }
                else {
                    if (otherOptionIndex != -1) {  //Other Key is present in the list, hence need to remove that from list
                        data.splice(otherOptionIndex, 1);
                    }
                }
                lookupModel.setProperty(sPath, data);
            },

            setOtherValueinTreeLookup: function (hierarchyData, treeFieldObject) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    fieldName = treeFieldObject?.fieldName,
                    other_lookup = {};
                if (treeFieldObject?.MM_Lookup_Other_Option) {
                    other_lookup.nodeId = "other";
                    other_lookup.text = "OTHER";
                    other_lookup.key = "other";
                    other_lookup.nodeFullPath = ">OTHER";

                    hierarchyData.push(other_lookup);

                    MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}/lookupData`, hierarchyData);
                }
            },

            onOpenTreeFragmnet: async function () {
                let oview = this.getView();
                await this.LoadFragment("ProductDataTree", oview, false);
            },

            // For Org Data 
            handleEditabilityforOrgData: function (viewName) {
                let oAppModel = this.getModelDetails("oAppModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    currentUserRole = oAppModel.getProperty("/userdetails/role"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    isUserRequestOwner = CreateProject.getProperty("/GeneralData/isUserRequestOwner"),
                    requestType = null,
                    requestStatus = null,
                    materialStatusId = null,
                    uiView = null,
                    orgDataBtnVisibility = {
                        "addPlant": false,
                        "editPlant": false,
                        "excludePlant": false,
                        "deletePlant": false
                    },
                    systemDataBtnVisibility = {
                        "addSystem": false,
                        "editSystem": false,
                        "excludeSystem": false,
                        "deleteSystem": false
                    };
                if (viewName == "CreateProject") {
                    requestType = this.fnGetRequestHeaderData("requestType");
                    requestStatus = this.fnGetRequestHeaderData("requestStatus");
                    materialStatusId = this.fnGetMaterialDetailsSelectedData("materialStatusId");
                }
                else if (viewName == "Repository") {
                    let Repository = this.getModelDetails("Repository"),
                        isExtend = Repository.getProperty("/MaterialSelected/isExtendOptionSelected");
                    requestType = isExtend ? 2 : 3;  //if Extend, RequestType = 2 orelse requestType = 3;
                }
                if (viewName === "Repository") {
                    // Create
                    if (requestType == 1) {
                        if (wfTaskType === "Request_Form_Submission") {
                            orgDataBtnVisibility = {
                                "addPlant": true,
                                "editPlant": true,
                                "excludePlant": true,
                                "deletePlant": true
                            };
                            systemDataBtnVisibility = {
                                "addSystem": true,
                                "editSystem": true,
                                "excludeSystem": true,
                                "deleteSystem": true
                            };
                        }
                        else if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                            orgDataBtnVisibility = {
                                "addPlant": true,
                                "editPlant": true,
                                "excludePlant": true,
                                "deletePlant": false
                            };
                            systemDataBtnVisibility = {
                                "addSystem": true,
                                "editSystem": true,
                                "excludeSystem": true,
                                "deleteSystem": false
                            };
                        }
                    }
                    //Modify Plant
                    else if (requestType == 3) {
                        if (wfTaskType === "Request_Form_Submission") {
                            orgDataBtnVisibility.editPlant = true;
                            systemDataBtnVisibility.editSystem = true;
                        }
                        else if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                            orgDataBtnVisibility.editPlant = true;
                            orgDataBtnVisibility.excludePlant = true;
                            systemDataBtnVisibility.editSystem = true;
                            systemDataBtnVisibility.excludeSystem = true;
                        }
                        else if (wfTaskType === "GQMD_WF_Task") {
                            orgDataBtnVisibility.excludePlant = true;
                            systemDataBtnVisibility.excludeSystem = true;
                        }
                    }
                    //Extend Scenario
                    if (requestType == 2) {
                        if (wfTaskType === "Request_Form_Submission") {
                            orgDataBtnVisibility = {
                                "addPlant": true,
                                "editPlant": true,
                                "excludePlant": false,
                                "deletePlant": true
                            };
                            systemDataBtnVisibility = {
                                "addSystem": true,
                                "editSystem": true,
                                "excludeSystem": false,
                                "deleteSystem": true
                            };
                        }
                        else if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                            orgDataBtnVisibility = {
                                "addPlant": false,
                                "editPlant": true,
                                "excludePlant": true,
                                "deletePlant": false
                            };
                            systemDataBtnVisibility = {
                                "addSystem": false,
                                "editSystem": true,
                                "excludeSystem": true,
                                "deleteSystem": false
                            };
                        }
                    }
                }
                if (viewName === "CreateProject") {
                    if ((!materialStatusId || materialStatusId == 1) && requestStatus == 1 && wfTaskType === "Request_Form_Submission") {
                        // Create
                        if (requestType == 1) {
                            orgDataBtnVisibility = {
                                "addPlant": true,
                                "editPlant": true,
                                "excludePlant": false,
                                "deletePlant": true
                            };
                            systemDataBtnVisibility = {
                                "addSystem": true,
                                "editSystem": true,
                                "excludeSystem": false,
                                "deleteSystem": true
                            };
                        }
                        //Modify Plant
                        else if (requestType == 3) {
                            systemDataBtnVisibility.editSystem = true;
                        }
                        //Extend Scenario
                        else if (requestType == 2) {
                            orgDataBtnVisibility = {
                                "addPlant": true,
                                "editPlant": true,
                                "excludePlant": false,
                                "deletePlant": true
                            };
                            systemDataBtnVisibility = {
                                "addSystem": true,
                                "editSystem": true,
                                "excludeSystem": false,
                                "deleteSystem": true
                            };
                        }
                    }
                    else if (materialStatusId == 2) {
                        // Create
                        if (requestType == 1) {
                            if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                                orgDataBtnVisibility = {
                                    "addPlant": true,
                                    "editPlant": true,
                                    "excludePlant": true,
                                    "deletePlant": false
                                };
                                systemDataBtnVisibility = {
                                    "addSystem": true,
                                    "editSystem": true,
                                    "excludeSystem": true,
                                    "deleteSystem": false
                                };
                            }
                        }
                        //Modify Plant
                        else if (requestType == 3) {
                            if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                                systemDataBtnVisibility.editSystem = false;
                                systemDataBtnVisibility.excludeSystem = true;
                            }
                            else if (wfTaskType === "GQMD_WF_Task") {
                                systemDataBtnVisibility.excludeSystem = true;
                            }
                        }
                        //Extend Scenario
                        else if (requestType == 2) {
                            if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                                orgDataBtnVisibility = {
                                    "addPlant": false,
                                    "editPlant": true,
                                    "excludePlant": true,
                                    "deletePlant": false
                                };
                                systemDataBtnVisibility = {
                                    "addSystem": false,
                                    "editSystem": true,
                                    "excludeSystem": true,
                                    "deleteSystem": false
                                };
                            }
                            else if (wfTaskType === "GQMD_WF_Task") {
                                orgDataBtnVisibility.excludePlant = true;
                                systemDataBtnVisibility.excludeSystem = true;
                            }
                        }
                        // System Extension
                        else if (requestType == 6) {
                            if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                                orgDataBtnVisibility = {
                                    "addPlant": true,
                                    "editPlant": true,
                                    "excludePlant": true,
                                    "deletePlant": false
                                };
                                systemDataBtnVisibility = {
                                    "addSystem": true,
                                    "editSystem": true,
                                    "excludeSystem": true,
                                    "deleteSystem": false
                                };
                            }
                            else if (wfTaskType === "GQMD_WF_Task") {
                                orgDataBtnVisibility.excludePlant = true;
                                systemDataBtnVisibility.excludeSystem = true;
                            }
                        }
                    }
                    else if (materialStatusId == 10 || materialStatusId == 11) {
                        // Create, extend, system extn
                        if (requestType == 1 || requestType == 2 || requestType == 6) {
                            if (wfTaskType === "GMDM_WF_Task" || wfTaskType === "Requester_Rework_WF_Task") {
                                orgDataBtnVisibility.editPlant = true;
                                systemDataBtnVisibility.editSystem = true;
                            }
                        }
                        else if (requestType == 3) { // modify
                            systemDataBtnVisibility.editSystem = true;
                        }
                    }
                }

                //User can only edit own request
                // if((currentUserRole == "repoViewOnly" && viewName === "Repository") || (!isUserRequestOwner && viewName === "CreateProject" && wfTaskType === "Request_Form_Submission")){
                if ((!isUserRequestOwner && viewName === "CreateProject" && wfTaskType === "Request_Form_Submission")) {
                    orgDataBtnVisibility = {
                        "addPlant": false,
                        "editPlant": false,
                        "excludePlant": false,
                        "deletePlant": false
                    };
                    systemDataBtnVisibility = {
                        "addSystem": false,
                        "editSystem": false,
                        "excludeSystem": false,
                        "deleteSystem": false
                    };
                }
                MaterialDetails.setProperty("/OrganizationalData/buttonVisibility", orgDataBtnVisibility);
                MaterialDetails.setProperty("/SystemData/buttonVisibility", systemDataBtnVisibility);
            },

            // For Additional Data - Description 
            /***********************Material List - Additional Data Description Tab ********************/
            /* @purpose: Open dialog to add or edit Description
            * @param1 {sap.ui.base.Event} : oEvent press event of add button.
            */
            onPressAddDescription: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    desriptionData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/descriptionData/data"),
                    languageList = LookupModel.getProperty("/selectedSystemDataDropdown/MM_LANGUAGE"),
                    filteredItems = languageList?.filter(item =>
                        !desriptionData.some(lang => lang.MM_LANGUAGE === item.LanguageName)       ///Removing already present Languages in the Data
                    );                                                                             ///from the Language List  
                LookupModel.setProperty("/selectedSystemDataDropdown/MM_FILTERED_LANGUAGE_DESCRIPTION", filteredItems);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/bDescLanguageCode", true);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descriptionDialogTitle", this.geti18nText("AddDescription"));
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/ODescAddOrUpdate", { "MM_LANGUAGE": "", "MM_MATERIAL_DESCRIPTION_MAKT_MAKTX": "" });
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueStateText", "");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueStateText", "");
                this.LoadFragment("Material_Desc", this.getView(), true);
            },

            /**Additional Data - Edit Description Dialog.
            * @param1 {sap.ui.base.Event} : oEvent press event of edit button.
            */
            onEditDescrAdditionalData: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    oSelectedObj = oEvent.getSource().getBindingContext("MaterialDetails").getObject(),
                    sPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedIndex = parseInt(sPath.charAt(sPath.length - 1)),
                    oSelectedObjCopy = $.extend(true, {}, oSelectedObj),
                    languageList = LookupModel.getProperty("/selectedSystemDataDropdown/MM_LANGUAGE");
                oSelectedObjCopy.selectedRow = selectedIndex;
                LookupModel.setProperty("/selectedSystemDataDropdown/MM_FILTERED_LANGUAGE_DESCRIPTION", languageList);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/ODescAddOrUpdate", oSelectedObjCopy);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/bDescLanguageCode", false);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descriptionDialogTitle", this.geti18nText("UpdateDescription"));
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueStateText", "");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueStateText", "");
                this.LoadFragment("Material_Desc", this.getView(), true);
            },

            /**Additional Data - Description Dialog(Ok press event).
            * @param1 {sap.ui.base.Event} : oEvent press event of add button.
            */
            pressDescrDialogOk: function (oEvent) {
                var that = this,
                    MaterialDetails = that.getModelDetails("MaterialDetails"),
                    oData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/descriptionData/ODescAddOrUpdate");


                if (oData.MM_LANGUAGE === "" && oData.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX === "") {
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueStateText", that.geti18nText("selectLanguageCode"));
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueStateText", that.geti18nText("descValidationEnterDesc"));
                    return;
                }
                if (oData.MM_LANGUAGE === "") {
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueStateText", that.geti18nText("selectLanguageCode"));
                    return;
                }
                if (oData.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX === "") {
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueStateText", that.geti18nText("descValidationEnterDesc"));
                    return;
                }
                var aData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/descriptionData/data");
                if (MaterialDetails.getProperty("/SystemDetails/AdditionalData/descriptionData/bDescLanguageCode")) {
                    oData.MM_NEWLY_ADDED = true;
                    aData.push(oData);
                } else {
                    aData[oData.selectedRow].MM_LANGUAGE = oData.MM_LANGUAGE;
                    aData[oData.selectedRow].MM_MATERIAL_DESCRIPTION_MAKT_MAKTX = oData.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX;
                    aData[oData.selectedRow].isModified = true;
                }
                oData.isDeleted = false;
                MaterialDetails.refresh();
                this.getView().byId("id_Material_Desc").close();
            },

            /**Additional Data - Description Dialog(Cancel press event).            
            */
            pressDescrDialogCancel: function () {
                this.getView().byId("id_Material_Desc").close();
            },

            /**Additional Data - Description Dialog(Delete press event).
            * @param1 {sap.ui.base.Event} : oEvent press event of Delete button.
            */
            onDeleteDescrAdditionalData: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    selectedIndex = parseInt(sPath.split('/').pop(10)),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                    aOldDescData = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalDataDescDtos`),
                    aData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/descriptionData/data"),
                    isNewlyAdded = MaterialDetails.getProperty(sPath)?.MM_NEWLY_ADDED,  //Records which are new for this material
                    materialListId = this.fnGetMaterialDetailsSelectedData("materialListId"),
                    isNewlyAddedRow = true,  //Records not yet saved
                    that = this,
                    deleteConfirmation = this.geti18nText("deleteConfirmation"),
                    deleteConfirmationExisting = this.geti18nText("deleteConfirmationExisting"),
                    language = MaterialDetails.getProperty(sPath)?.MM_LANGUAGE,
                    requestTypeId = this.fnGetRequestHeaderData("requestType");

                aOldDescData?.map(item => {
                    if (item.MM_LANGUAGE == language) {
                        isNewlyAddedRow = false;
                    }
                })

                if((currentView === "CreateProject" && requestTypeId == 3 && !isNewlyAdded) || (currentView === "Repository" && !isNewlyAdded)){
                    this.showMessage(deleteConfirmationExisting, "Q", ["YES", "NO"], "YES", async function (action) {
                        if (action === "YES") {
                            aData?.map(item => {
                                if (item.MM_LANGUAGE == language) {
                                    item.isDeleted = true;
                                    MaterialDetails.refresh(true);
                                }
                            })
                        }
                    });
                }

                else {
                    this.showMessage(deleteConfirmation, "Q", ["YES", "NO"], "YES", async function (action) {
                        if (action === "YES") {
                            if (!isNewlyAddedRow && materialListId) {
                                that.fnDeleteDescOrBasicDataTextAdditionalData(language, materialListId, currentSystemId, "Description").then(function (isSuccess) {
                                    if (isSuccess) {
                                        aOldDescData.splice(selectedIndex, 1);
                                        MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalDataDescDtos`, JSON.parse(JSON.stringify(aOldDescData)));
                                        that._deleteSelectedRow(selectedIndex, aData, "MaterialDetails");
                                        MaterialDetails.refresh(true);
                                    }
                                });
                            }
                            else {
                                that._deleteSelectedRow(selectedIndex, aData, "MaterialDetails");
                            }
                        }
                    });
                }

            },

            fnDeleteDescOrBasicDataTextAdditionalData: async function (language, materialListId, currentSystemId, deleteFor) {
                return new Promise((resolve, reject) => {
                    let payload = {
                        "language": language,
                        "materialListId": materialListId,
                        "systemId": currentSystemId
                    },
                        oAppModel = this.getModelDetails("oAppModel"),
                        viewName = oAppModel.getProperty("/sideNavigation/currentView"),
                        that = this, url;

                    if (deleteFor == "Description") {
                        url = "MM_JAVA/deleteAddDataDesc";
                    } else if (deleteFor == "BasicDataText") {
                        url = "MM_JAVA/deleteAddDataBasicDataText";
                    }

                    this.fnProcessDataRequest(url, "DELETE", null, true, payload,
                        async function (responseData) {
                            //await that.getDatabyMaterialListId(materialListId);
                            that.onGetFilteredDataMatChangeLog(viewName, true);
                            that.closeBusyDialog();
                            resolve(true);
                        },
                        function (error) {
                            that.closeBusyDialog();
                            reject(false);
                        }
                    );
                })
            },

            /**purpose: Delete the selected row
           * @param1 {string} :sPath - Selected row path.
           * @param2 {string} : aData - Desc table items
           */
            // _deleteSelectedRow: function (selectedIndex, aData, sModelName) {
            //     var spliceArray = [],
            //         oModel = this.getModelDetails(sModelName);
            //     spliceArray.push(selectedIndex);
            //     // spliceArray.sort(function (a, b) {
            //     //     return b - a;
            //     // });
            //     for (var z = 0; z < spliceArray.length; z++) {
            //         aData.splice(spliceArray[z], 1);
            //     }
            //     oModel.refresh(true);
            // },

            _deleteSelectedRow: function (selectedIndex, aData, sModelName) {
                var oModel = this.getModelDetails(sModelName);
                aData.splice(selectedIndex, 1);
                oModel.refresh(true);
            },


            /*****************Material List - Additional Data Basic Data Text Tab **************/
            //Additiona Data - Basic Data Text Dialog
            onPressAddBasicDataText: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    basicDataTextData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/basicDataText/data"),
                    languageList = LookupModel.getProperty("/selectedSystemDataDropdown/MM_LANGUAGE"),
                    filteredItems = languageList?.filter(item =>
                        !basicDataTextData?.some(lang => lang.MM_LANGUAGE === item.LanguageName)   ///Removing already present Languages in the Data
                    );                                                                             ///from the Language List  
                LookupModel.setProperty("/selectedSystemDataDropdown/MM_FILTERED_LANGUAGE_BASICDATATEXT", filteredItems);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/bBasicDataTextLanguageCode", true);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextDialogTitle", this.geti18nText("AddBasicDataText"));
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextAddOrUpdate", { "MM_LANGUAGE": "", "MM_MATERIAL_LONG_DESC_STXH_TDNAME": "" });
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueStateText", "");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueStateText", "");
                this.LoadFragment("Material_BasicDataText", this.getView(), true);
            },

            /**Additional Data - Edit Basic Data Text Dialog.
            * @param1 {sap.ui.base.Event} : oEvent press event of edit button.
            */
            onEditBasicDataText: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    oSelectedObj = oEvent.getSource().getBindingContext("MaterialDetails").getObject(),
                    sPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    selectedIndex = parseInt(sPath.charAt(sPath.length - 1)),
                    oSelectedObjCopy = $.extend(true, {}, oSelectedObj),
                    languageList = LookupModel.getProperty("/selectedSystemDataDropdown/MM_LANGUAGE");
                oSelectedObjCopy.selectedRow = selectedIndex;
                LookupModel.setProperty("/selectedSystemDataDropdown/MM_FILTERED_LANGUAGE_BASICDATATEXT", languageList);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextAddOrUpdate", oSelectedObjCopy);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/bBasicDataTextLanguageCode", false);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextDialogTitle", this.geti18nText("UpdateBasicDataText"));
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueStateText", "");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueStateText", "");
                this.LoadFragment("Material_BasicDataText", this.getView(), true);
            },

            /**Additional Data - Basic Data Text Dialog(Delete press event).
            * @param1 {sap.ui.base.Event} : oEvent press event of Delete button.
            */
            onDeleteBasicDataText: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    selectedIndex = parseInt(sPath.split('/').pop(10)),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                    aOldBasicData = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalDataBasicDataTextDtos`),
                    aData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/basicDataText/data"),
                    isNewlyAdded = MaterialDetails.getProperty(sPath)?.MM_NEWLY_ADDED, //Records which are new for this material
                    materialListId = this.fnGetMaterialDetailsSelectedData("materialListId"),
                    isNewlyAddedRow = true, //Records not yet saved
                    that = this,
                    deleteConfirmation = this.geti18nText("deleteConfirmation"),
                    deleteConfirmationExisting = this.geti18nText("deleteConfirmationExisting"),
                    language = MaterialDetails.getProperty(sPath)?.MM_LANGUAGE,
                    requestTypeId = this.fnGetRequestHeaderData("requestType");

                aOldBasicData?.map(item => {
                    if (item.MM_LANGUAGE == language) {
                        isNewlyAddedRow = false;
                    }
                })

                if((currentView === "CreateProject" && requestTypeId == 3 && !isNewlyAdded) || (currentView === "Repository" && !isNewlyAdded)){
                    this.showMessage(deleteConfirmationExisting, "Q", ["YES", "NO"], "YES", async function (action) {
                        if (action === "YES") {
                            aData?.map(item => {
                                if (item.MM_LANGUAGE == language) {
                                    item.isDeleted = true;
                                    MaterialDetails.refresh(true);
                                }
                            })
                        }
                    });
                }

                else{
                    this.showMessage(deleteConfirmation, "Q", ["YES", "NO"], "YES", async function (action) {
                        if (action === "YES") {
                            if (!isNewlyAddedRow && materialListId) {
                                that.fnDeleteDescOrBasicDataTextAdditionalData(language, materialListId, currentSystemId, "BasicDataText").then(function (isSuccess) {
                                    if (isSuccess) {
                                        aOldBasicData.splice(selectedIndex);
                                        MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalDataBasicDataTextDtos`, JSON.parse(JSON.stringify(aOldBasicData)));
                                        that._deleteSelectedRow(selectedIndex, aData, "MaterialDetails");
                                        MaterialDetails.refresh(true);
                                    }
                                });
                            }
                            else {
                                // Delete the Langugage from the Updated local UI Model Data even it's saved or not saved in DB
                                that._deleteSelectedRow(selectedIndex, aData, "MaterialDetails");
                            }
                        }
                    });
                }
            },

            /*Additional Data -  Basic Data Text Dialog
            *@Event Ok press event
            */
            pressBasicDataTextDialogOk: function () {
                var that = this,
                    MaterialDetails = that.getModelDetails("MaterialDetails"),
                    oData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/basicDataText/basicTextAddOrUpdate");
                if (oData.MM_LANGUAGE === "" && oData.MM_MATERIAL_LONG_DESC_STXH_TDNAME === "") {
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueStateText", that.geti18nText("selectLanguageCode"));
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueStateText", that.geti18nText("basicDataTextValidationDesc"));
                    return;
                }
                if (oData.MM_LANGUAGE === "") {
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueStateText", that.geti18nText("selectLanguageCode"));
                    return;
                }
                if (oData.MM_MATERIAL_LONG_DESC_STXH_TDNAME === "") {
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueStateText", that.geti18nText("basicDataTextValidationDesc"));
                    return;
                }
                var aData = MaterialDetails.getProperty("/SystemDetails/AdditionalData/basicDataText/data");
                if (MaterialDetails.getProperty("/SystemDetails/AdditionalData/basicDataText/bBasicDataTextLanguageCode")) {
                    oData.MM_NEWLY_ADDED = true;
                    aData.push(oData);
                } else {
                    aData[oData.selectedRow].MM_LANGUAGE = oData.MM_LANGUAGE;
                    aData[oData.selectedRow].MM_MATERIAL_LONG_DESC_STXH_TDNAME = oData.MM_MATERIAL_LONG_DESC_STXH_TDNAME;
                    aData[oData.selectedRow].isModified = true;
                }
                oData.isDeleted = false;
                MaterialDetails.refresh();
                this.getView().byId("id_Material_BasicDataText").close();
            },

            /* Additional Data -  Basic Data Text Dialog 
            *@Event: Cancel press event
            */
            pressBasicDataTextDialogCancel: function () {
                this.getView().byId("id_Material_BasicDataText").close();
            },

            /*Change - function : Description Language Code
            *Set value state and Text as null
            */
            changeDescLanguageCode: function (oEvent) {
                var MaterialDetails = this.getModelDetails("MaterialDetails");
                // this.fnHandleComboboxValidation(oEvent);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descLanguageValueStateText", "");
            },

            /*Change - function : Material Description 
            *Set value state and Text as null
            */
            changeMaterialDesc: function (oEvent) {
                //Update the model
                var oSource = oEvent.getSource(),
                    sValue = oSource.getValue().trim();
                oSource.setValue(sValue);
                var MaterialDetails = this.getModelDetails("MaterialDetails");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/descNoteValueStateText", "");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/descriptionData/ODescAddOrUpdate/MM_MATERIAL_DESCRIPTION_MAKT_MAKTX", sValue);
            },

            /*Change - function : Basic Data Text Language Code
            *Set value state and Text as null
            */
            changeBasicTextLanguageCode: function (oEvent) {
                //Update the model
                var MaterialDetails = this.getModelDetails("MaterialDetails");
                // this.fnHandleComboboxValidation(oEvent);
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextLanguageValueStateText", "");
            },

            /*Change - function : Basic Text Note
            *Set value state and Text as null
            */
            changeMaterialBasicText: function (oEvent) {
                var oSource = oEvent.getSource(),
                    sValue = oSource.getValue().trim();
                oSource.setValue(sValue);
                var MaterialDetails = this.getModelDetails("MaterialDetails");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueState", "None");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextNoteValueStateText", "");
                MaterialDetails.setProperty("/SystemDetails/AdditionalData/basicDataText/basicTextAddOrUpdate/MM_MATERIAL_LONG_DESC_STXH_TDNAME", sValue);
            },

            onGetRequestNo: function () {
                let viewName = this.getViewName();

                if (viewName === "CreateProject") {
                    let CreateProject = this.getModelDetails("CreateProject"),
                        requestNumber = CreateProject.getProperty("/RequestHeader/data/requestNumber");
                    return requestNumber;
                }
                else if (viewName === "CreateMassRequest") {
                    let CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                        requestNumber = CreateMassRequest.getProperty("/RequestHeader/data/requestNumber");
                    return requestNumber;
                }

            },

            //Get available material numbers from part of material number(Running Search)
            ongetMaterialNumber: function (oEvent) {
                let inputValue = oEvent.getSource().getValue(),
                    that = this,
                    createProjectModel = this.getModelDetails("CreateProject"),
                    RepositoryModel = this.getModelDetails("Repository"),
                    viewName = this.getViewName(),
                    materialTypeId = null;

                if (viewName === "CreateProject") {
                    materialTypeId = createProjectModel.getProperty("/RequestHeader/data/materialType");
                }
                else if (viewName === "Repository") {
                    let materialTypeIdRepo = parseInt(RepositoryModel.getProperty("/FilterOptions/BasicFilter/materialType"));
                    materialTypeId = this.onGetNullValue(materialTypeIdRepo, "number")
                }

                if (this.debouncedSearchTimer) {
                    clearTimeout(this.debouncedSearchTimer);
                }
                this.debouncedSearchTimer = setTimeout(function () {
                    if (inputValue.length > 1) {
                        let payload = {
                            "materialNumber": inputValue,
                            "materialTypeId": materialTypeId
                        };
                        that.fnProcessDataRequest("MM_JAVA/getMaterialListByMaterialNumber", "POST", null, false, payload,
                            function (responseData) {
                                switch (viewName) {
                                    case "CreateProject":
                                        createProjectModel.setProperty("/MaterialList/existingMaterial/MaterialSearchHelpSet", responseData?.materialDesc);
                                        break;
                                    case "Repository":
                                        RepositoryModel.setProperty("/FilterOptions/BasicFilter/MaterialSearchHelpSet", responseData?.materialDesc);
                                        RepositoryModel.setProperty("/MaterialSearchHelpSet", responseData?.materialDesc);
                                        break;
                                }
                            },
                            function (responseData) {
                            });
                    }
                }, 500);
            },

            //Get attributes list according to UI View for Advance Searches
            onSelectedViewIdType: function (viewIdSource, requestSource) {
                let that = this,
                    sKey = viewIdSource.getSelectedKey(),
                    sUrl = "MM_JAVA/getAttributesList", oSelectedLineItem,
                    oPayload = {
                        "materialTypeId": null,
                        "uiView": sKey,
                        "requestSource": requestSource
                    };
                if (requestSource == "Request_Management") {
                    oSelectedLineItem = viewIdSource.getBindingContext("RequestManagement").getObject()
                }
                else if (requestSource == "Repository") {
                    oSelectedLineItem = viewIdSource.getBindingContext("Repository").getObject()
                }
                this.fnProcessDataRequest(sUrl, "POST", null, true, oPayload,
                    function (responseData) {
                        oSelectedLineItem.fieldNameList = responseData.attributeList;
                        that.closeBusyDialog();
                    },
                    function (error) {
                        that.closeBusyDialog();
                    }
                );
            },

            //Read the SAP data based on Material No. for editing and extending case
            fnLoadSAPDataMaterialNo: function (materialNumber) {
                return new Promise(async (resolve, reject) => {
                    let that = this,
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        LookupModel = this.getModelDetails("LookupModel"),
                        sEntityName = "/HeadDataSet",
                        sFilter = `Material eq '${materialNumber}'`,
                        sExpandEntityName = "ToClientData,ToMaterialDescrption,ToMaterialLongtext,ToUnitOfMeasure,ToClassification/toClassificationItem,ToPlant",
                        requestTypeId = this.fnGetRequestHeaderData("requestType"),
                        systemData = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                        oDataSystemToId = LookupModel.getProperty("/oDataTargetSystemToId"),
                        targetSystemMaterialIdPresent = false,
                        viewName = this.getViewName(),
                        requestSource = viewName === "CreateProject" ? "Request_Management" : "Repository",
                        systemMaterialNumbers = [], responseDataCombined = [];

                    that.openBusyDialog();

                    try {
                        for (let system of systemData) {
                            let systemObject = {}
                            if (system?.MM_TARGET_SYSTEM_MATERIAL_ID) {
                                systemObject = {
                                    systemId: system?.MM_SYSTEM_ID,
                                    materialNumber: system?.MM_TARGET_SYSTEM_MATERIAL_ID
                                }
                                targetSystemMaterialIdPresent = true;
                            } else {
                                systemObject = {
                                    systemId: system?.MM_SYSTEM_ID,
                                    materialNumber: materialNumber
                                }
                            }
                            systemMaterialNumbers.push(systemObject)
                        }

                        if (targetSystemMaterialIdPresent) {
                            for (let system of systemMaterialNumbers) {
                                let originKey = Object.keys(oDataSystemToId).find(
                                    key => oDataSystemToId[key] == system?.systemId
                                );

                                sFilter = `Material eq '${system?.materialNumber}'`;

                                const responseData = await that.fnGetOdataService("oDataModelAllSystem", sEntityName, sFilter, sExpandEntityName
                                );

                                const systemResponse = responseData?.results?.find(item => item.SAP__Origin === originKey);
                                if (systemResponse) {
                                    responseDataCombined.push(systemResponse);
                                }
                            }
                        } else {
                            const responseData = await that.fnGetOdataService(
                                "oDataModelAllSystem",
                                sEntityName,
                                sFilter,
                                sExpandEntityName
                            );
                            responseDataCombined = responseData?.results || [];
                        }

                        if (responseDataCombined?.length) {
                            let selectedOrgPlants = MaterialDetails.getProperty("/OrganizationalData/selectedPlants"),
                                oDataResults = responseDataCombined,
                                plantRefList = LookupModel.getProperty("/MM_PLANT_REF_LIST");
                            if (requestTypeId != 1) {
                                //Logic for Copying Plant Specific Material Status in Plant Table from OData Services 
                                oDataResults.forEach(function (responseItem) {
                                    var orgDataList = responseItem?.ToPlant?.results,
                                        // Assiging the System ID
                                        orgDataListsforSystemId = responseItem?.SAP__Origin == "SAP_GBLECC" ? 1 : 2;
                                    orgDataList.forEach(function (plantItem) {
                                        let plantCode = plantItem?.Plant,
                                            plantId = plantRefList?.find(obj =>
                                                obj.MM_PLANT_REF_LIST_CODE == plantCode && obj.MM_TARGET_SYSTEM_ID == orgDataListsforSystemId
                                            )?.MM_KEY,
                                            plantSpecificMatStatus = plantItem?.PurStatus == "" ? "BLANK" : plantItem?.PurStatus,
                                            mappedObjIndex = selectedOrgPlants?.findIndex(obj =>
                                                obj.MM_PLANT_ID == plantId
                                            );
                                        if (mappedObjIndex != -1) {
                                            selectedOrgPlants[mappedObjIndex].plantSpecificMatStatus = plantSpecificMatStatus;
                                        }
                                    });
                                });
                            }

                            if ((requestSource === "Request_Management" && requestTypeId != "1") || (requestSource === "Repository")) {
                                MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/organizationalDataDtos", JSON.parse(JSON.stringify(selectedOrgPlants)));
                            }

                            that.fnProcessClassificationData(responseDataCombined);
                            that.fnProcessBasicData(responseDataCombined);
                            that.fnProcessAltUomData(responseDataCombined);
                        }

                        resolve(true);
                    } catch (error) {
                        console.error("Error in HeadDataSet Service:", error);

                        MessageBox.error("Failed to load Material Data from the system. Please try again later.", {
                            title: "Service Error",
                            details: error?.message || error
                        });

                        resolve(false);
                    }
                    finally {
                        that.closeBusyDialog();
                    }
                });
            },


            //Get Repository Data based on Material Number(Product Data, Desc, Basic Data Text)
            fnGetRepositoryDataOnMaterialNumberJAVA: async function (materialNumber) {
                return new Promise(async (resolve) => {
                    var url = `MM_JAVA/getAllRepositoryDetailsSystemByMaterialNumber`,
                        that = this,
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        CreateProject = this.getModelDetails("CreateProject"),
                        Repository = this.getModelDetails("Repository"),
                        oAppModel = this.getModelDetails("oAppModel"),
                        viewName = this.getViewName(),
                        materialTypeId = Repository.getProperty("/MaterialSelected/materialTypeId"),
                        requestTypeId = viewName === "CreateProject" ? CreateProject.getProperty("/RequestHeader/data/requestType") : null,
                        requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                        currentUserRole = oAppModel.getProperty("/userdetails/userRole"),
                        requestSource = viewName === "CreateProject" ? "Request_Management" : "Repository",
                        MaterialDetailsLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MaterialDetails.json"),
                        MaterialDetailsLocalModel = new JSONModel(),
                        MaterialDetailsLocalModelData,
                        payload = {
                            "materialNumber": parseInt(materialNumber),
                            "requestSource": requestSource
                        },
                        id_MS_Commited_To_Repo_NotSyndicated = 10,
                        id_MS_Commited_To_Repo_SyndicatedError = 11,
                        id_MS_Not_Applicable = 13,
                        id_MS_Not_Selected = 15,
                        id_MS_Syndicated = 9,
                        id_MS_Draft = 1;
                    that.getView().setModel(MaterialDetailsLocalModel, "MaterialDetailsLocalModel");
                    await MaterialDetailsLocalModel.loadData(MaterialDetailsLocation);
                    MaterialDetailsLocalModelData = MaterialDetailsLocalModel.getData();
                    this.fnProcessDataRequest(url, "POST", null, true, payload,
                        async function (responseData) {
                            MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/isOldDataFromExistingMaterial", true);
                            //Repo Material status ID
                            if ((requestSource === "Request_Management" && requestTypeId != "1")) {
                                let selectedPath = CreateProject.getProperty("/MaterialList/selectedPath"),
                                    Selectedindex = selectedPath.slice(selectedPath.lastIndexOf('/') + 1);
                                CreateProject.setProperty(`/MaterialList/materialList/${Selectedindex}/repositoryStatusId`, responseData?.materialStatusId);
                                MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/repositoryStatusId", responseData?.materialStatusId);
                            }

                            //materialRequestChangeLogDtos
                            if (responseData?.materialRequestChangeLogDtos) {
                                if ((requestSource === "Request_Management" && requestTypeId != "1") || (requestSource === "Repository")) {
                                    MaterialDetails.setProperty("/materialChangeHistory/requestLog", responseData?.materialRequestChangeLogDtos);
                                }
                            }
                            //Additional Data - Description
                            if (responseData?.additionalDataDescDtos) {
                                if ((requestSource === "Request_Management" && requestTypeId != "1") || (requestSource === "Repository")) {
                                    MaterialDetails.setProperty("/AdditionalData/descriptionData/data", responseData.additionalDataDescDtos);
                                    // To store the Old Material Data in a Model for Post inorder to capture change Logs.
                                    MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/additionalDataDescDtos", JSON.parse(JSON.stringify(responseData?.additionalDataDescDtos)));
                                }
                            }

                            //Additional Data - Basic Text
                            if (responseData?.additionalDataBasicDataTextDtos) {
                                if ((requestSource === "Request_Management" && requestTypeId != "1") || (requestSource === "Repository")) {
                                    MaterialDetails.setProperty("/AdditionalData/basicDataText/data", responseData.additionalDataBasicDataTextDtos);
                                    // To store the Old Material Data in a Model for Post inorder to capture change Logs.
                                    MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/additionalDataBasicDataTextDtos", JSON.parse(JSON.stringify(responseData?.additionalDataBasicDataTextDtos)));
                                }
                            }
                            //Product Data
                            if (responseData?.productData) {
                                let responseproductDataDto = responseData?.productData;
                                // To store the Old Material Data in a Model for Post inorder to capture change Logs.
                                if (requestTypeId != "1") {
                                    MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/productData", JSON.parse(JSON.stringify(responseproductDataDto)));
                                }
                                for (let className in responseproductDataDto) {
                                    let classDetails = responseproductDataDto[className],
                                        classPath = `/ProductData/${className}`;
                                    // MaterialDetails.setProperty(`/ProductData/${className}/data`, classDetails);
                                    for (let fieldName in classDetails) {
                                        let P_Data = classPath + "/data/" + fieldName,
                                            P_Tree_Data = classPath + "/Additional_Data/" + fieldName,
                                            P_Full_Path_Data = classPath + "/data/" + fieldName + "_Full_Path",
                                            P_Visible = classPath + "/MM_VISIBILITY/" + fieldName + "_Other",
                                            P_Visible_Full_Path = classPath + "/MM_VISIBILITY/" + fieldName + "_Full_Path",
                                            fieldTypePathRepo = "/ProductData/productDataOutline/" + className + "/MM_UI_FIELD_TYPE/" + fieldName,
                                            fieldTypePath = "/productDataOutline/" + className + "/MM_UI_FIELD_TYPE/" + fieldName,
                                            fieldTypeRepo = Repository.getProperty(fieldTypePathRepo),
                                            fieldType = CreateProject.getProperty(fieldTypePath),
                                            P_Other_Field_Option = classPath + "/MM_LOOKUP_OTHER_VALUE_OPTION/" + fieldName,
                                            V_Other_Field_Option = MaterialDetails.getProperty(P_Other_Field_Option), // true /false
                                            V_Data = classDetails[fieldName],
                                            P_Full_Path = fieldName + "_Full_Path",
                                            V_Full_Path_Data = classDetails[P_Full_Path],
                                            // V_Data = MaterialDetails.getProperty(P_Data),
                                            // V_Full_Path_Data = MaterialDetails.getProperty(P_Full_Path_Data),
                                            Selected_Node_Text = V_Full_Path_Data?.split(">").pop();
                                        if (V_Other_Field_Option === true && (V_Data === "other" || V_Data?.includes("other"))) {
                                            MaterialDetails.setProperty(P_Visible, true);
                                        }
                                        else {
                                            MaterialDetails.setProperty(P_Visible, false);
                                        }
                                        if (fieldType === "MultiComboBox" || fieldTypeRepo === "MultiComboBox") {
                                            // MaterialDetails.setProperty(`/ProductData/${className}/data/${fieldName}`, that.stringToArray(V_Data));
                                            classDetails[fieldName] = that.stringToArray(V_Data);
                                        }
                                        if (fieldType === "Tree" || fieldTypeRepo === "Tree") {
                                            MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}`, {});
                                            // if (V_Data) {
                                            //     MaterialDetails.setProperty(P_Visible_Full_Path, true);
                                            let field_Visible = MaterialDetails.getProperty(`${classPath}/MM_VISIBILITY/${fieldName}`);
                                            MaterialDetails.setProperty(`/ProductDataStatic/TreeData/TreeFields/${fieldName}`, {});
                                            if (V_Data) {
                                                    if(field_Visible){
                                                    MaterialDetails.setProperty(P_Visible_Full_Path, true);
                                                }
                                                MaterialDetails.setProperty(P_Tree_Data, Selected_Node_Text);
                                                if (V_Data != "other") {
                                                    that.getDependentAttributes(requestNumber, fieldName, V_Data);
                                                }
                                            }
                                        }
                                        if (fieldType === "CheckBox" || fieldTypeRepo === "CheckBox") {
                                            classDetails[fieldName] = JSON.parse(V_Data);
                                        }
                                        if (requestSource === "Request_Management" && requestTypeId == "1") {
                                            //Material_Lifecycle_Status
                                            if (fieldName === "1025") {
                                                let materialLifeCycleDefaultValue = MaterialDetails.getProperty(`/ProductData/${className}/MM_DEFAULT_VALUE/${fieldName}`) || null;
                                                // MaterialDetails.setProperty(`/ProductData/${className}/data/${fieldName}`, materialLifeCycleDefaultValue);
                                                classDetails[fieldName] = materialLifeCycleDefaultValue;
                                            }
                                            // Global Material Description or Global Material Long Description
                                            else if (fieldName == "1016" || fieldName == "1017") {
                                                classDetails[fieldName] = null;
                                            }
                                        }
                                    }
                                    MaterialDetails.setProperty(`/ProductData/${className}/data`, classDetails);
                                }
                            }


                            //System Data
                            if (responseData?.repoSystemData) {
                                // Destructure the item to exclude targetSystemMaterialId and targetSystemMaterialTypeId
                                // Because targetSystemMaterialId and targetSystemMaterialTypeId is not required in while copying from ref material
                                responseData.repoSystemData.map(item => {
                                    if (requestSource === "Request_Management" && requestTypeId == 1) { // For Create Scenario
                                        item.requestSystemStatusId = 1;
                                        item.repoSystemStatusIdTemp = item.repositorySystemStatusId;
                                        item.isIncluded = true;
                                        item.repositorySystemStatusId = null; // Just taking the reference, so don't copy the repository status ID
                                        item.materialNumber = null;
                                    }
                                    else if (requestTypeId == "2") { // For Extend Request Type
                                        if (item.repositorySystemStatusId == id_MS_Syndicated) {
                                            item.requestSystemStatusId = id_MS_Not_Applicable;
                                            item.isIncluded = false;
                                        }
                                        else {
                                            item.isIncluded = true;
                                            item.requestSystemStatusId = id_MS_Draft;
                                        }
                                    }
                                    else if (requestTypeId == "3") { //For Change Request Type
                                        item.isIncluded = true;
                                        item.requestSystemStatusId = id_MS_Draft;
                                    }
                                    if (item.repositorySystemStatusId == id_MS_Commited_To_Repo_NotSyndicated || item.repositorySystemStatusId == id_MS_Commited_To_Repo_SyndicatedError) {
                                        MaterialDetails.setProperty(`/GeneralData/setBasicDataDefaultValue/${item.MM_SYSTEM_ID}`, true);
                                    }
                                });
                                MaterialDetails.setProperty("/SystemData/selectedSystems", JSON.parse(JSON.stringify(responseData.repoSystemData)));
                                if (requestTypeId != "1") {
                                    MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/systemData", JSON.parse(JSON.stringify(responseData.repoSystemData)));
                                }
                                for (let system of responseData.repoSystemData) {
                                    await that.fnToRenderOdataLookup(system.MM_SYSTEM_ID);
                                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${system.MM_SYSTEM_ID}`, JSON.parse(JSON.stringify(MaterialDetailsLocalModelData.SystemDetails)));
                                }
                            }

                            //Organisational Data
                            if (responseData?.organizationalDataDtos) {
                                let organizationalDataDtos = responseData?.organizationalDataDtos || [],
                                    oldOrganizationalDataDtos = [];
                                if (organizationalDataDtos) {
                                    organizationalDataDtos?.map(function (item) {
                                        if (requestTypeId == "2") { // For Extend Scenario
                                            if (item.repositoryPlantStatusId == id_MS_Syndicated || item.repositoryPlantStatusId == id_MS_Commited_To_Repo_NotSyndicated || item.id_MS_Commited_To_Repo_SyndicatedError) {
                                                item.requestPlantStatus = id_MS_Not_Selected;
                                                item.isIncluded = false;
                                            }
                                            else {
                                                item.requestPlantStatus = id_MS_Draft;
                                                item.isIncluded = true;
                                            }
                                        }
                                        else if (requestTypeId == "3") { // For Change Scenario
                                            item.requestPlantStatus = id_MS_Not_Applicable;
                                            item.isIncluded = false;
                                        }
                                        else if (requestTypeId == "1" && requestSource === "Request_Management") { // For Create Scenario
                                            item.repositoryPlantStatusId = null;
                                            item.requestPlantStatus = id_MS_Draft;
                                            item.isIncluded = true;
                                            if (item?.systemId == 1) { // For GEP System, the default value is "Z0"
                                                item.plantSpecificMatStatus = "Z0";
                                            }
                                            else if (item?.systemId == 2) { // For RP1 System, the default value is "Z1"
                                                item.plantSpecificMatStatus = "Z1";
                                            }
                                        }
                                        else {
                                            item.requestPlantStatus = id_MS_Draft;
                                            item.isIncluded = true;
                                        }

                                        if (viewName === "Repository") {
                                            item.isIncluded = false;
                                        }
                                    });
                                    oldOrganizationalDataDtos = JSON.parse(JSON.stringify(organizationalDataDtos));
                                    if (oldOrganizationalDataDtos) {
                                        oldOrganizationalDataDtos?.map(function (item) {
                                            item.isIncluded = false;
                                        });
                                    }
                                    MaterialDetails.setProperty("/OrganizationalData/selectedPlants", organizationalDataDtos);
                                    if (requestTypeId != "1") {
                                        MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/organizationalDataDtos", JSON.parse(JSON.stringify(oldOrganizationalDataDtos)));
                                    }
                                    else {
                                        MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/organizationalDataDtos", []);
                                    }
                                }
                            }

                            //Product Static Data
                            if (responseData?.productDataStatic) {
                                // // To store the Old Material Data in a Model for Post inorder to capture change Logs.
                                var productDataStaticOld = responseData?.productDataStatic,
                                    oldAlternateIdDto = productDataStaticOld?.malternateIdDto;
                                oldAlternateIdDto?.map(function (item) {
                                    if (requestTypeId == 1) { // Create Scenario
                                        item.Repository_Row_ID = null;
                                        item.MM_NEWLY_ADDED = true;
                                    }
                                    else {
                                        item.MM_NEWLY_ADDED = false;
                                    }
                                });
                                productDataStaticOld.alternateIdDto = oldAlternateIdDto;
                                delete productDataStaticOld.malternateIdDto;
                                if ((requestSource === "Request_Management" && requestTypeId != "1") || (requestSource === "Repository")) {
                                    MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/productDataStatic", JSON.parse(JSON.stringify(productDataStaticOld)));
                                }

                                //To set the Alternate ID's in the Updated Payload
                                let alternateIdDto = oldAlternateIdDto,
                                    alternateID = [];
                                alternateIdDto?.map(function (item) {
                                    var lineAlternateId = {
                                        "Alternate_ID_Type_Country": item.MM_ALTERNATE_ID_TYPE_COUNTRY,
                                        "Alternate_ID_Type": item.MM_ALTERNATE_ID_TYPE,
                                        "Field_Value": item.MM_ALTERNATE_ID_FIELD_VALUE,
                                        "isDeleted": item.isDeleted,
                                        "materialListId": item.materialListId,
                                        "alternateId": item.alternateId,
                                        "Repository_Row_ID": item.MM_ALTERNATE_ID_REPOSITORY_ROW_ID,
                                        "MM_NEWLY_ADDED": null,
                                        "isActive": item.isActive || false
                                    };
                                    if (requestTypeId == 1) { // Create Scenario
                                        lineAlternateId.Repository_Row_ID = null;
                                        lineAlternateId.MM_NEWLY_ADDED = true;
                                    }
                                    else {
                                        lineAlternateId.MM_NEWLY_ADDED = false;
                                    }
                                    alternateID.push(lineAlternateId);
                                })
                                MaterialDetails.setProperty("/ProductDataStatic/alternateID/selectedIDs", alternateID);
                            }

                            //Additional Data 
                            if (responseData?.targetSystem) {
                                if ((requestSource === "Request_Management" && requestTypeId != "1") || (requestSource === "Repository")) {
                                    for (let currentSystem in responseData?.targetSystem) {
                                        let targetSystemExist = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/targetSystem"),
                                            systemDetails = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystem}`);
                                        if (!targetSystemExist) {
                                            MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/targetSystem", {});
                                        }
                                        if (!systemDetails) {
                                            MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystem}`, {});
                                        }
                                    }
                                    for (let currentSystem in responseData?.targetSystem) {

                                        //Basic Data Text
                                        let additionaldataBasicDataTextDto = responseData?.targetSystem[currentSystem].additionalDataBasicDataTextDtos;
                                        let AdditionalDataBasicDataText = [];
                                        additionaldataBasicDataTextDto.map(function (item) {
                                            var lineAdditionalDataBasicDataText = {
                                                "MM_LANGUAGE": item.MM_LANGUAGE,
                                                "MM_MATERIAL_LONG_DESC_STXH_TDNAME": item.MM_MATERIAL_LONG_DESC_STXH_TDNAME,
                                                "isSyndicated": item.isSyndicated,
                                                "systemId": item.systemId,
                                                "materialListId": item.materialListId,
                                                "MM_NEWLY_ADDED": false,
                                                "isDeleted": false
                                            }

                                            AdditionalDataBasicDataText.push(lineAdditionalDataBasicDataText);
                                        })
                                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystem}/AdditionalData/basicDataText/data`, AdditionalDataBasicDataText);
                                        MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystem}/additionalDataBasicDataTextDtos`, JSON.parse(JSON.stringify(AdditionalDataBasicDataText)));

                                        //Description
                                        let additionalDataDescDto = responseData?.targetSystem[currentSystem].additionalDataDescDtos;
                                        let AdditionalDataDescDto = [];
                                        additionalDataDescDto.map(function (item) {
                                            var lineAdditionalDataDescDto = {
                                                "MM_LANGUAGE": item.MM_LANGUAGE,
                                                "MM_MATERIAL_DESCRIPTION_MAKT_MAKTX": item.MM_MATERIAL_DESCRIPTION_MAKT_MAKTX,
                                                "isSyndicated": item.isSyndicated,
                                                "systemId": item.systemId,
                                                "materialListId": item.materialListId,
                                                "MM_NEWLY_ADDED": false,
                                                "isDeleted": false
                                            }
                                            AdditionalDataDescDto.push(lineAdditionalDataDescDto);
                                        })
                                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystem}/AdditionalData/descriptionData/data`, AdditionalDataDescDto)
                                        MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystem}/additionalDataDescDtos`, JSON.parse(JSON.stringify(AdditionalDataDescDto)));
                                    }
                                }
                            }

                            if (responseData?.repoESignDtoList) {
                                MaterialDetails.setProperty("/materialChangeHistory/eSignLog", responseData?.repoESignDtoList);
                            }
                            that.closeBusyDialog();
                            resolve(true);
                        },
                        function (responseData) {
                            that.closeBusyDialog();
                            resolve(true);
                        }
                    );
                    // if((currentUserRole == "repoViewOnly" && viewName === "Repository") || (!isUserRequestOwner && viewName === "CreateProject" && wfTaskType === "Request_Form_Submission")){
                    //     that.fnMakeSystemTabButtonsInvisible();
                    // }
                    // if((!isUserRequestOwner && viewName === "CreateProject" && wfTaskType === "Request_Form_Submission")){
                    //     that.fnMakeSystemTabButtonsInvisible();
                    // }
                });
            },

            onSearchMatChangeLog: function (oEvent) {
                let inputValue = oEvent.getSource().getValue(),
                    MaterialDetails = this.getModelDetails("MaterialDetails");

                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/inputValue", inputValue);
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/currentPage", 1);         //To go to page 1 whenever user clicks on Search button
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/start", 1)    //To set the pagination tray start to 1 whenever user clicks on Search button  
                this.onGetFilteredDataMatChangeLog(this.getViewName(), true);

            },

            onGetFilteredDataMatChangeLog: function (currentModel, isBusyCheck) {
                let currModel = this.getModelDetails(currentModel),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    inputValue = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/inputValue"),
                    currentPage = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/currentPage") - 1,
                    rowsPerPage = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/rowsPerPage"),
                    that = this;

                if (currentModel === "CreateProject") {
                    var materialNumber = this.fnGetMaterialDetailsSelectedData("materialNumber"),
                        materialListId = this.fnGetMaterialDetailsSelectedData("materialListId"),
                        requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                        searchPayload =
                        {
                            "fieldName": inputValue,
                            "materialListId": materialListId,
                            "materialNumber": materialNumber,
                            "page": currentPage,
                            "requestNumber": this.onGetNullValue(requestNumber, "number"),
                            "requestSource": "Request_Management",
                            "size": rowsPerPage
                        };
                }
                if (currentModel === "Repository") {
                    var materialNumber = currModel.getProperty("/MaterialSelected/materialNumber"),
                        searchPayload =
                        {
                            "fieldName": inputValue,
                            "materialListId": null,
                            "materialNumber": materialNumber,
                            "page": currentPage,
                            "requestNumber": null,
                            "requestSource": null,
                            "size": rowsPerPage
                        };
                }
                this.onSetTimeOut(1000).then(() => {
                    that.onTriggerSearchMatChangeLog(searchPayload, currentModel, isBusyCheck);
                });
            },

            onTriggerSearchMatChangeLog: function (searchPayload, currModel, isBusyCheck) {
                let that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    materialNumber = searchPayload.materialNumber,
                    materialListId = currModel === "CreateProject" ? searchPayload.materialListId : null,
                    sUrl;

                if (currModel === "CreateProject") {
                    sUrl = "MM_JAVA/getRequestMaterialChangeLogDetailsPagination";
                }
                else if (currModel === "Repository") {
                    sUrl = "MM_JAVA/getRepoMaterialChangeLogDetailsPagination";
                }

                if (materialListId || materialNumber) {
                    that.fnProcessDataRequest(sUrl, "POST", null, isBusyCheck, searchPayload,
                        function (responseData) {
                            let logList = null;
                            if (responseData?.result) {
                                if (currModel === "CreateProject") {
                                    logList = responseData?.result?.changeLogDtoList;
                                }
                                else if (currModel === "Repository") {
                                    logList = responseData?.result?.mchangeLogDtoList;
                                }
                                /* Commenting as, the Code and Desc needs to be managed at Change History and excel Downlaod
                                if (logList) {
                                      logList.map(function (item) {
                                          let updatedNewValue = item.newValue,
                                              updatedOldValue = item.oldValue,
                                              fieldPath = "/" + item.fieldName,
                                              lookupData = LookupModel.getProperty(fieldPath);
                                          if (lookupData) {
                                              if (item.uiView == "Product Data") {
                                                 
                                              }
                                              else if (item.uiView == "Basic Data 1" || item.uiView == "Basic Data 2") {
                                                  let basicDataMapList = null, map_LookupList = null, codePath = null, descPath = null, mappedNewObj = null, mappedOldObj = null;
                                                  basicDataMapList = LookupModel.getProperty("/basicDataList");
                                                  map_LookupList = basicDataMapList.find(obj => obj.bindingPath == item.fieldName);
                                                  codePath = map_LookupList.path_Code;
                                                  descPath = map_LookupList.path_Desc;
  
                                                  mappedNewObj = lookupData.find(obj =>
                                                      obj[codePath] == item.newValue
                                                  );
                                                  if (mappedNewObj) {
                                                      updatedNewValue = mappedNewObj[descPath];
                                                  }
  
                                                  mappedOldObj = lookupData.find(obj =>
                                                      obj[codePath] == item.oldValue
                                                  );
                                                  if (mappedOldObj) {
                                                      updatedOldValue = mappedOldObj[descPath];
                                                  }
                                              }
                                          }
                                          item.updatedOldValue = updatedOldValue;
                                          item.updatedNewValue = updatedNewValue;
                                      });
                                  }*/

                                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/totalrecords", responseData.result.totalCount);
                                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/totalPages", responseData.result.totalPages);
                                that.paginationMatChangeLog();
                                that.closeBusyDialog();
                                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/footerVisible", true);
                                if (responseData.result.totalPages === 0) {
                                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/footerVisible", false);
                                }
                            }
                            MaterialDetails.setProperty("/materialChangeHistory/changeLog/logList", logList);
                        },
                        function (responseData) {
                            MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/footerVisible", false);
                        });
                }

            },

            onSetPaginationTrayTextMatChange: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    paginationTrayStart = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/trayDetails/start"),
                    paginationTrayEnd,
                    totalPagesArray = [],
                    totalPages = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/totalPages");

                if (paginationTrayStart + 4 <= totalPages) {                  //Condition to set the pagination tray end according to number of total pages
                    paginationTrayEnd = paginationTrayStart + 4;
                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/end", paginationTrayStart + 4);
                }
                else {
                    paginationTrayEnd = totalPages;
                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/end", totalPages);
                }

                for (let page = paginationTrayStart; page <= paginationTrayEnd; page++) {
                    totalPagesArray.push({ "page": page });
                }
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/totalPagesArray", totalPagesArray);
            },

            paginationMatChangeLog: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    totalPages = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/totalPages");
                if (totalPages <= 5) {
                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/end", totalPages);
                }
                this.onSetPaginationTrayTextMatChange();

                //For addding MM_ActivePaginationLinkColor to link of page 1 when loading the screen.
                var currentPage = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/currentPage");
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

            onPageClickMatChangeLog: function (oEvent) {
                this.getView().getControlsByFieldGroupId().map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId().map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedPage = oEvent.getSource().getText();
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/currentPage", parseInt(selectedPage));
                oEvent.getSource().removeStyleClass("MM_PaginationLinkColor");
                oEvent.getSource().addStyleClass("MM_ActivePaginationLinkColor");
                this.onGetFilteredDataMatChangeLog(this.getViewName(), true);
            },

            onNextPageMatChangeLog: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    currentPage = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/currentPage"),
                    paginationTrayStart = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/trayDetails/start"),
                    paginationTrayEnd = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/trayDetails/end");
                if (currentPage === paginationTrayEnd) {
                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/start", paginationTrayStart + 1);
                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/end", paginationTrayEnd + 1);
                    this.onSetPaginationTrayTextMatChange();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/currentPage", currentPage + 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage + 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.onGetFilteredDataMatChangeLog(this.getViewName(), true);
            },

            onPrevPageMatChangeLog: function () {
                var MaterialDetails = this.getModelDetails("MaterialDetails"),
                    currentPage = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/currentPage"),
                    paginationTrayStart = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/trayDetails/start"),
                    paginationTrayEnd = MaterialDetails.getProperty("/PaginationDetailsMatChangeLog/trayDetails/end");
                if (currentPage === paginationTrayStart) {
                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/start", paginationTrayStart - 1);
                    MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/end", paginationTrayEnd - 1);
                    this.onSetPaginationTrayTextMatChange();
                }
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/currentPage", currentPage - 1);
                function checkCurrent(item) {
                    if (item.getText() == currentPage - 1) {
                        item.removeStyleClass("MM_PaginationLinkColor");
                        item.addStyleClass("MM_ActivePaginationLinkColor");
                        return item;
                    }
                }
                let totalElementArray = this.getView().getControlsByFieldGroupId('iD_PageNumber');
                totalElementArray.forEach(checkCurrent);
                this.onGetFilteredDataMatChangeLog(this.getViewName(), true);
            },

            onSelectPageSizeMatChangeLog: function (oEvent) {
                var rowsPerPage = parseInt(oEvent.getSource().getSelectedItem().mProperties.text),
                    MaterialDetails = this.getModelDetails("MaterialDetails");
                //Just to remove the previous selection in css
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.removeStyleClass("MM_ActivePaginationLinkColor") });
                this.getView().getControlsByFieldGroupId('iD_PageNumber').map(item => { item.addStyleClass("MM_PaginationLinkColor") });
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/rowsPerPage", rowsPerPage);
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/currentPage", 1);
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/start", 1);
                MaterialDetails.setProperty("/PaginationDetailsMatChangeLog/trayDetails/end", 5);
                this.onGetFilteredDataMatChangeLog(this.getViewName(), true);
            },

            fnGetMassRequestData: async function (selectedRequestNo) {
                var that = this,
                    MassRequest = this.getModelDetails("MassRequest"),
                    CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    reqHeaderEditability = {},
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    URL = "MM_JAVA_MASS/getRequestHeaderDataByRequestNumber?requestNumber=" + selectedRequestNo;
                await this.fnProcessDataRequest(URL, "POST", null, true, null,
                    async function (responseData) {

                        let requestHeader = {},
                            reqChangeLog = [],
                            reqHeaderData = responseData;

                        requestHeader = {
                            "requestNumber": responseData.requestNumber,
                            "requestType": responseData.requestTypeId,
                            "requestDescription": responseData.requestDescription,
                            "materialType": responseData.materialTypeId,
                            "reqSubType": responseData.requestSubTypeId,
                            "requestStatus": responseData.requestStatusId,
                            "dateRequired": responseData.dateRequired,
                            "uiView": responseData.uiView,
                            "priority": responseData.priority,
                            "createdOn": responseData.createdOn,
                            "createdBy": responseData.createdBy,
                            "changedOn": responseData.changedOn,
                            "changedBy": responseData.changedBy,
                            "scenario": 2,//to update the request 
                        };
                        //that.onLoadRequestSubtype(reqHeaderData.requestTypeId);//To load request subtype rules
                        //To handle editability of request header in different scenarios
                        if (wfTaskType === "Request_Form_Submission" && reqHeaderData.requestStatusId === 1
                            || wfTaskType === "Requester_Rework_WF_Task" || wfTaskType === "MassRequest_GMDM_WF_Task") {
                            reqHeaderEditability = {
                                //"requestDescription": true,
                                //"requestDate": true,
                                "materialType": false,
                                "requestType": false
                            }
                        }
                        else {
                            reqHeaderEditability = {
                                // "requestDescription": false,
                                //"requestDate": false,
                                "materialType": false,
                                "requestType": false
                            }
                        }
                        CreateMassRequest.setProperty("/RequestHeader/editable", reqHeaderEditability);

                        CreateMassRequest.setProperty("/RequestHeader/oldData", JSON.parse(JSON.stringify(reqHeaderData)));

                        await CreateMassRequest.setProperty("/RequestHeader/data", requestHeader);

                        CreateMassRequest.setProperty("/RequestHeader/savedData", JSON.parse(JSON.stringify(requestHeader)));
                        // if (massCreateProjData?.changeLogDtos) {
                        //     reqChangeLog = massCreateProjData.changeLogDtos;
                        // }
                        //CreateMassRequest.setProperty("/requestChangeHistory/historyDetails", reqChangeLog);

                        await MassRequest.setProperty("/fromMassRequestPage", true);
                        CreateMassRequest.setProperty("/RequestHeader/valueState", {});
                        that.navigateTo("CreateMassRequest");
                        that.closeBusyDialog();

                    },
                    function (oError) {
                        that.closeBusyDialog();
                    }
                );
            },

            compareObjects: function (obj1, obj2) {
                const keys1 = Object.keys(obj1);
                const keys2 = Object.keys(obj2);

                if (keys1.length !== keys2.length) {
                    return false;
                }

                for (const key of keys1) {
                    const value1 = obj1[key];
                    const value2 = obj2[key];

                    if ((value1 == null || value1 === "") && (value2 == null || value2 === "")) {
                        continue;
                    }

                    if (typeof value1 === 'object' && typeof value2 === 'object' && value1 !== null && value2 !== null) {
                        if (!this.compareObjects(value1, value2)) {
                            return false;
                        }
                    }
                    else if (Array.isArray(value1) ^ Array.isArray(value2)) {         //For cases when same key in obj1 & obj2 are one of type array and one of type not array
                        // Special case: one is an array and the other is not
                        const arrayValue = Array.isArray(value1) ? value1 : value2;
                        const nonArrayValue = Array.isArray(value1) ? value2 : value1;
                        const arrayAsString = this.arrayToString(arrayValue);

                        if (arrayAsString !== nonArrayValue) {
                            return false;
                        }
                    }
                    else if (value1 != value2) {
                        return false;
                    }
                }
                return true;
            },
            fnGetMassAttachmentByRequestNumber: function (requestNumber, modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    that = this,
                    url = "MM_JAVA_MASS//getMassUploadAttributesAndExcel?requestNumber=" + requestNumber;
                this.fnProcessDataRequest(url, "GET", null, true, null, function (responseData) {
                    if (modelName === "CreateMassRequest") {
                        modelDetails.setProperty("/MassUpload/massRequestReUpload", responseData?.massUploadAttributesDto?.massRequestReUpload);
                    }
                    if (responseData?.massUploadAttributesDto) {
                        modelDetails.setProperty("/MassUpload/templateRef/uiView", responseData?.massUploadAttributesDto?.uiView);
                        modelDetails.setProperty("/MassUpload/templateRef/systemId", responseData?.massUploadAttributesDto?.targetSystemId);
                        modelDetails.setProperty("/MassUpload/templateRef/syndicationState", responseData?.massUploadAttributesDto?.markForSyndication);
                    }
                    else {
                        modelDetails.setProperty("/MassUpload/templateRef/syndicationState", true);
                    }
                    //Remove _code from attribute list
                    let aAttributeList = responseData?.massUploadAttributesDto?.attributes,
                        aFinalAttributeList = [], documentsList = [], attachmentcount = 0;
                    if (aAttributeList !== undefined) {
                        for (var i = 0; i < aAttributeList.length; i++) {
                            let nIndex = aAttributeList[i].lastIndexOf("_Key");
                            if (nIndex !== -1) {
                                aFinalAttributeList.push(aAttributeList[i].slice(0, nIndex));
                            } else {
                                aFinalAttributeList.push(aAttributeList[i]);
                            }
                        }
                    }
                    documentsList = responseData?.totalCommentsAttachmentsDto?.mmDmsDocumentsDtos;
                    attachmentcount = responseData?.totalCommentsAttachmentsDto?.totalCount;
                    that.getMassAttributeList(responseData?.massUploadAttributesDto?.uiView);

                    modelDetails.setProperty("/MassUpload/templateRef/attributesList", aFinalAttributeList);
                    modelDetails.setProperty("/MassUpload/documentsRef/documentsList", documentsList); //mmAttachmentsDto
                    modelDetails.setProperty("/MassUpload/documentsRef/attachmentcount", attachmentcount);
                    that.closeBusyDialog();
                },
                    function (responseData) {
                        that.closeBusyDialog();
                    });
            },

            //Document Comment Model Reference 
            onUpdateNewDocCommentModel: function (modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    docCommentData = modelDetails.getProperty("/DocComments"),
                    docCommentModel = this.getView().getModel("docCommentModel");
                if (!docCommentModel) {
                    docCommentModel = new JSONModel();
                    this.getView().setModel(docCommentModel, "docCommentModel");
                }
                docCommentData.usedFor = modelDetails;
                docCommentModel.setData(docCommentData);
                docCommentModel.refresh(true);
            },

            onGetAttachmentByRequestNumber: function (requestNumber, materialNumber, modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    that = this, url, getAttachmentPayload;

                url = "MM_JAVA/getTotalAttachmentsByRequestNumberOrMaterialNumber";

                //CreateMassRequest
                //     url = "MM_JAVA//getTotalExcelByRequestNumber?requestNumber=" + requestNumber;

                getAttachmentPayload = {
                    "requestNumber": requestNumber,
                    "materialNumber": materialNumber
                };

                this.fnProcessDataRequest(url, "POST", null, true, getAttachmentPayload, function (responseData) {
                    modelDetails.setProperty("/DocComments/documents/existingDoc", responseData?.result?.mmDmsDocumentsDtos); //mmAttachmentsDto
                    modelDetails.setProperty("/DocComments/documents/attachmentcount", responseData?.result?.totalCount);
                    that.onUpdateNewDocCommentModel(modelName);
                    that.closeBusyDialog();
                },
                    function (responseData) { })
            },

            fnGetSelectedAttributesMassUpload: function () {
                let oAttributesId = this.getView().byId("mcmbMassAttributes"),
                    attributeList = [], sFieldType, sFieldName, sAttributeValue;
                for (let i = 0; i < oAttributesId.getSelectedItems().length; i++) {
                    sFieldType = oAttributesId.getSelectedItems()[i].getCustomData()[0].getProperty("value"),
                        sAttributeValue = oAttributesId.getSelectedItems()[i].getCustomData()[1].getProperty("value"),
                        sFieldName = oAttributesId.getSelectedItems()[i].getProperty("key");
                    let selectedAttribute = {
                        "attribute": sFieldName,
                        "uiFieldType": sFieldType,
                        "attribute_value": sAttributeValue
                    }
                    attributeList.push(selectedAttribute);
                }
                return attributeList;
            },

            fnToHandleSameNameFiles: function (modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    fileData = modelDetails.getProperty("/DocComments/documents/attachedDocument/file");
                var fileName = fileData.name;
                var docCommentModel = this.getView().getModel("docCommentModel");
                var listOfAllDocuments = docCommentModel.getProperty("/documents/existingDoc");
                if (!listOfAllDocuments) return false;
                return listOfAllDocuments.some(document => document.documentName === fileName);
            },

            fnUploadComplete: function (modelName, oEvent, fileUploadId) {
                if (oEvent.getParameter("files") !== undefined && oEvent.getParameter("files") !== null) {
                    var modelName = this.getModelDetails(modelName),
                        oFileUploader = this.byId(fileUploadId),
                        fileSize = (oEvent?.getParameter("files")[0]?.size / 1024 / 1024)?.toFixed(2);
                    if (fileSize > 8) {
                        var errorMsg = this.resourceBundle.getText("FileSizelimitError");
                        this.showMessage(errorMsg, "E", ["OK"], "OK", function (action) {
                        });
                        oFileUploader.clear();
                    }
                    else {
                        modelName.setProperty("/DocComments/documents/attachedDocument/file", oEvent.getParameter("files")[0]);
                    }
                }
            },

            fnUploadFileAttach: function (modelName, requestNumber, materialNumber, materialListId, massDocSelectedTab) {
                var modelDetails = this.getModelDetails(modelName),
                    fileData = modelDetails.getProperty("/DocComments/documents/attachedDocument/file");
                if (fileData != null && fileData != undefined) {
                    this.openBusyDialog();
                    var that = this,
                        fileName = fileData.name;
                    // if(that.fnDownloadFileContent(null,modelName))
                    //     that.onUploadFileContent(fileName, fileData, requestNumber, materialNumber, materialListId, modelName, massDocSelectedTab);
                    // else{
                    //     this.showMessage("File name already exists", "E", ["OK"], "OK", function (action) {
                    //     });
                    // }

                    if (!that.fnToHandleSameNameFiles(modelName)) {
                        that.onUploadFileContent(fileName, fileData, requestNumber, materialNumber, materialListId, modelName, massDocSelectedTab);
                    }
                    else {
                        this.closeBusyDialog();
                        this.showMessage("File name already exists", "E", ["OK"], "OK", function (action) {
                        });

                    }
                } else {
                    var errorMsg = this.resourceBundle.getText("ChooseFileToBeUploaded");
                    this.showMessage(errorMsg, "E", ["OK"], "OK", function (action) {
                    });
                }
            },

            onUploadFileContent: function (name, data, requestNumber, materialNumber, materialListId, modelName, massDocSelectedTab) {
                var reader = new FileReader(),
                    type = data.type === "" ? "application/octet-stream" : data.type,
                    oFileUploader,
                    that = this;
                if ((requestNumber != "" && requestNumber != undefined && requestNumber != null) || (materialNumber != "" && materialNumber != undefined && materialNumber != null)) {
                    reader.readAsDataURL(data);
                    reader.onload = function (e) {
                        var sUrl, oFilePayload = {}, fileContentPayload = [], dmsScenario,
                            oAppModel = that.getModelDetails("oAppModel"),
                            modelDetails = that.getModelDetails(modelName),
                            content = e.currentTarget.result.replace("data:" + type + ";base64,", ""),
                            currentDate = that.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                            loggedInUserEmail = oAppModel.getData().userdetails.userMailID,
                            wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                            CreateMassRequest = that.getModelDetails("CreateMassRequest"),
                            taskInstanceId = oAppModel.getProperty("/taskDetails/wfTaskInstanceId"),
                            currentView = oAppModel.getProperty("/sideNavigation/currentView");

                        oFilePayload = {
                            "requestNumber": requestNumber,
                            "materialNumber": materialNumber,
                            "materialListId": materialListId,
                            "documentName": name,
                            "documentType": type,
                            "createdBy": loggedInUserEmail,
                            "createdOn": currentDate,
                            "encodedFileContent": content,
                            "taskInstanceId": taskInstanceId,
                            "included": true
                        };
                        if (modelName === "CreateProject" || modelName === "Repository" || (modelName === "CreateMassRequest" && massDocSelectedTab)) {
                            sUrl = currentView === "Repository" ? "MM_JAVA/file/upload/repo" : "MM_JAVA/file/upload";
                            oFileUploader = that.byId("fileUploader");
                            oFilePayload.dmsScenario = 1;

                            //get list of all systems present
                            //add them in the array in the payload
                            //otherwise empty array

                            let MaterialDetails = that.getModelDetails("MaterialDetails"),
                                listOfSelectedSystems = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/systemData");

                            let systemData = [];

                            listOfSelectedSystems.map(function (item) {
                                var lineSystemData = {
                                    "dmsDocSystemId": item.MM_SYSTEM_ID,
                                    "docSystemStatus": currentView === "Repository" ? 10 : 2,
                                    "markForSyndication": false,
                                    "included": true
                                }

                                systemData.push(lineSystemData);
                            })

                            oFilePayload["systemData"] = systemData;
                            oFilePayload["documentSyndicationStatus"] = currentView === "Repository" ? 10 : 1;

                            fileContentPayload = [oFilePayload];

                        } else if (modelName === "CreateMassRequest") {
                            sUrl = "MM_JAVA_MASS/massUpload/uploadExcelData";
                            oFileUploader = that.byId("massFileUploader");

                            oFilePayload.dmsScenario = 2;
                            //fileContentPayload = oFilePayload;
                            let uiViewKey = modelDetails.getProperty("/MassUpload/templateRef/uiView"),
                                targetSystem = CreateMassRequest.getProperty("/MassUpload/templateRef/systemId"),
                                syndicationState = CreateMassRequest.getProperty("/MassUpload/templateRef/syndicationState"),
                                attributeList = that.fnGetSelectedAttributesMassUpload(),
                                requestType = CreateMassRequest.getProperty("/RequestHeader/data/requestType"),
                                materialType = parseInt(modelDetails.getProperty("/RequestHeader/data/materialType")) || 0,
                                viewId = null;
                            if (requestType == "4") {
                                viewId = "Mass Create";
                            } else if (requestType == "5") {
                                viewId = uiViewKey;
                            } else if (requestType == "7") {
                                viewId = "Mass System Extension";
                            } else if (requestType == "8") {
                                viewId = "Mass Plant Extension";
                            }
                            let oFileHeaderAttribute = {
                                "requestNumber": requestNumber,
                                "uiView": viewId,
                                "attributeList": attributeList,
                                "materialType": materialType,
                                "markForSyndication": syndicationState
                            };
                            fileContentPayload = {
                                "massUploadAttributes": oFileHeaderAttribute,
                                "dmsDocumentsDto": oFilePayload
                            };
                            fileContentPayload.massUploadAttributes.targetSystemId = parseInt(targetSystem) || null;
                            // Payload updated as per requirement for mass upload
                            if (modelName === "CreateMassRequest" && wfTaskType === "MassRequest_GMDM_WF_Task") {
                                fileContentPayload.massUploadAttributes.massRequestReUpload = true;
                                fileContentPayload.dmsDocumentsDto.taskInstanceId = taskInstanceId || null;
                                fileContentPayload.dmsDocumentsDto.taskName = "GMDM_WF_Task";
                            } else if (modelName === "CreateMassRequest" && wfTaskType !== "MassRequest_GMDM_WF_Task") { // wfTaskType = "Request_Form_Submission"
                                fileContentPayload.massUploadAttributes.massRequestReUpload = false;
                                fileContentPayload.dmsDocumentsDto.taskInstanceId = null;
                                fileContentPayload.dmsDocumentsDto.taskName = "Request_Form_Submission";
                            }
                            /*   End     */
                        }
                        that.fnProcessDataRequest(sUrl, "POST", null, false, fileContentPayload,
                            function (responseData) {
                                oFileUploader?.clear();
                                if (responseData.statusCode === "200" || responseData.statusCode === 200) {
                                    sap.m.MessageToast.show(that.geti18nText("FILEUPLOADSUCCESSMSG"));
                                    if (modelName === "CreateProject" && materialListId) {
                                        that.onGetAttachmentByMaterialListId(materialListId, modelName);
                                    } else if (modelName === "CreateProject" && materialNumber) {
                                        that.fnGetRepositoryDocumentsByMaterialNumber(materialNumber);
                                    }
                                    else if (modelName === "Repository") {
                                        that.fnGetRepositoryDocumentsByMaterialNumber(materialNumber);
                                    }
                                    else if (modelName === "CreateMassRequest" && massDocSelectedTab){
                                        that.onGetAttachmentByRequestNumber(requestNumber, materialNumber, modelName);
                                    }
                                    else { //Mass upload data
                                        that.fnGetMassAttachmentByRequestNumber(requestNumber, modelName);
                                    }
                                } else {
                                    var errorMsg;
                                    if (responseData?.responseMessage) {
                                        errorMsg = responseData.responseMessage;
                                    } else {
                                        errorMsg = that.resourceBundle.getText("fileUploadError");
                                    }

                                    that.showMessage(errorMsg, "E", ["OK"], "OK", function (action) {
                                    });
                                }
                                modelDetails.setProperty("/DocComments/documents/attachedDocument/file", null);
                                that.closeBusyDialog();
                            },
                            function (responseData) {
                                that.closeBusyDialog();
                                // var errorMsg = that.resourceBundle.getText("fileUploadError");
                                // that.showMessage(errorMsg, "E", ["OK"], "OK", function (action) {
                                // });
                            })
                    }
                } else {
                    that.closeBusyDialog();
                    oFileUploader?.clear();
                    var errorMsg = that.resourceBundle.getText("errrorMessageForRequestNumberGenerationFail");
                    that.showMessage(errorMsg, "E", ["OK"], "OK", function (action) {
                    });

                }
            },

            fnDownloadFileContent: function (oEvent, modelName) {
                var oAppModel = this.getModelDetails("oAppModel"),
                    dmsDocID = oEvent?.getSource()?.getBindingContext(modelName)?.getObject()?.dmsDocID,
                    documentId = oEvent?.getSource()?.getBindingContext(modelName)?.getObject()?.documentId,
                    url = "MM_JAVA/file/download/" + dmsDocID,
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    mimeType,
                    that = this;

                if (currentView == "Repository") {
                    url = "MM_JAVA/file/downloadRepo/" + documentId;
                }

                this.fnProcessDataRequest(url, "GET", null, false, null,
                    function (responseData) {
                        var fileContent = responseData?.data?.encodedFileContent,
                            decodedFileContent = atob(fileContent),
                            byteArray = new Uint8Array(decodedFileContent.length),
                            fileType = responseData.data.documentType,
                            link = document.createElement('a');
                        for (var currByte = 0; currByte < decodedFileContent.length; currByte++) {
                            byteArray[currByte] = decodedFileContent.charCodeAt(currByte);
                        }
                        var blob = new Blob([byteArray.buffer], {
                            type: fileType
                        });
                        fileType = fileType.split('.').pop().toLowerCase();
                        switch (fileType) {
                            case 'pdf':
                                mimeType = 'application/pdf';
                                break;
                            case 'png':
                                mimeType = 'image/png';
                                break;
                            default:
                                mimeType = 'application/octet-stream';
                                break;
                        }
                        link.download = responseData?.data?.documentName;
                        link.href = 'data:' + mimeType + ';base64,' + fileContent;
                        link.click();

                        var _pdfurl = URL.createObjectURL(blob);
                        if (fileType != "sheet") {
                            window.open(_pdfurl, "_blank");
                        }

                        that.closeBusyDialog();

                    },
                    function (responseData) {
                        that.closeBusyDialog();
                    })
            },

            fnDeleteDocument: function (requestNumber, materialNumber, materialListId, oEvent, modelName) {
                var docObject = oEvent?.getSource()?.getParent()?.getBindingContext("docCommentModel")?.getObject(),
                    actions = ["NO", "YES"],
                    confirmationMsg = this.resourceBundle.getText("deleteConfirmation"),
                    documentId = docObject.dmsDocID,
                    that = this,
                    url = `MM_JAVA/deleteFileBasedOnMaterialNumberOrRequestNumber`;
                if (materialNumber) {
                    url = "MM_JAVA/deleteFileFromRepoBasedOnMaterialNumberOrRequestNumber"
                }
                let deleteDocumentPayload =
                {
                    "attachmentID": documentId,
                    "materialNumber": materialNumber,
                    "requestNumber": requestNumber
                }
                this.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                    if (action === "YES") {
                        that.fnProcessDataRequest(url, "POST", null, true, deleteDocumentPayload,
                            function (responseData) {
                                if (modelName == "CreateProject") {
                                    if (materialListId)
                                        that.onGetAttachmentByMaterialListId(materialListId, modelName);
                                    else {
                                        that.fnGetRepositoryDocumentsByMaterialNumber(materialNumber);
                                    }
                                } else {
                                    that.onGetAttachmentByRequestNumber(requestNumber, materialNumber, modelName);
                                }
                            },
                            function (responseData) { })
                    }
                });
            },

            onGetAttachmentByMaterialListId: function (materialListId, modelName, materialNumber) {
                var modelDetails = this.getModelDetails(modelName),
                    that = this,
                    url = "MM_JAVA/getTotalAttachmentsByMaterialListIdOrMaterialNumber",
                    getAttachmentPayload = {
                        "materialListId": materialListId
                    };

                if (materialNumber) {
                    getAttachmentPayload["materialNumber"] = materialNumber;
                }

                this.fnProcessDataRequest(url, "POST", null, true, getAttachmentPayload,
                    function (responseData) {
                        modelDetails.setProperty("/DocComments/documents/existingDoc", responseData?.result?.mmDmsDocumentsDtos); //mmAttachmentsDto
                        modelDetails.setProperty("/DocComments/documents/attachmentcount", responseData?.result?.totalCount);
                        that.onUpdateNewDocCommentModel(modelName);
                        that.closeBusyDialog();
                    },
                    function (responseData) { })
            },

            onGetAttachmentByMaterialNumber: function (materialNumber, modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    that = this,
                    url = "MM_JAVA/getTotalAttachmentsByMaterialListIdOrMaterialNumber",
                    getAttachmentPayload = {
                        "materialNumber": materialNumber
                    };

                this.fnProcessDataRequest(url, "POST", null, true, getAttachmentPayload,
                    function (responseData) {
                        modelDetails.setProperty("/DocComments/documents/existingDoc", responseData?.result?.mmDmsDocumentsDtos); //mmAttachmentsDto
                        modelDetails.setProperty("/DocComments/documents/attachmentcount", responseData?.result?.totalCount);
                        that.onUpdateNewDocCommentModel(modelName);
                        that.closeBusyDialog();
                    },
                    function (responseData) { })
            },

            fnPostDocumentToContentServer: async function (materialNumber) {

                try {
                    var docCommentModel = this.getView().getModel("docCommentModel");
                    var documentList = docCommentModel.getProperty("/documents/existingDoc");
                    var tmpModel = this.getOwnerComponent().getModel("oDocumentModel");

                    // Calculate progress indicator increment based on the number of documents
                    const incrementForProgressIndicator = 100 / documentList.length;
                    let displayValueForProgressIndicator = 0;

                    // Create a busy indicator
                    // const busyIndicator = new sap.m.BusyIndicator();

                    // Create a progress indicator
                    const progressIndicator = new sap.m.ProgressIndicator({
                        displayValue: "0%",
                        percentValue: 0.0,
                        showValue: true,
                        displayOnly: true
                    });


                    if (!this.oDefaultDialog) {
                        this.oDefaultDialog = new sap.m.Dialog({
                            showHeader: false,
                            content: [progressIndicator] // Add both indicators to the dialog
                        });
                    }

                    // Add the dialog as a dependent to the view
                    this.getView().addDependent(this.oDefaultDialog);

                    // Open the dialog to show progress and busy indicator
                    this.oDefaultDialog.open();

                    // Initialize progress indicator
                    progressIndicator.setDisplayValue("0%");
                    progressIndicator.setPercentValue("0.00");

                    // Loop through each document in the list and post it to the content server sequentially
                    for (const item of documentList) {
                        const fileName = item.documentName;
                        const lastDotIndex = fileName.lastIndexOf(".");

                        var documentId = item.documentId,
                            url = "MM_JAVA/file/download/" + documentId,
                            mimeType,
                            that = this;

                        this.fnProcessDataRequest(url, "GET", null, false, null,
                            async function (responseData) {
                                var encodedFileContent = responseData?.data?.encodedFileContent;

                                that.closeBusyDialog();

                                let fileNameBeforeExtension, fileExtension;
                                if (lastDotIndex !== -1) {
                                    fileNameBeforeExtension = fileName.substring(0, lastDotIndex);
                                    fileExtension = fileName.substring(lastDotIndex + 1);
                                } else {
                                    fileNameBeforeExtension = fileName;
                                    fileExtension = '';
                                }



                                const encodedMaterialNumber = encodeURI(materialNumber);
                                const encodedFileName = encodeURI(fileNameBeforeExtension);
                                const encodedFileExtension = encodeURI(fileExtension);
                                const base64 = encodedFileContent;
                                const slug = `${encodedMaterialNumber}:${encodedFileName}:${encodedFileExtension}`;





                                const headers = {
                                    "slug": slug,
                                    "Content-Type": "application/json;odata=verbose"
                                };


                                // Set headers and other configurations for the model
                                tmpModel.setHeaders(null);
                                tmpModel.setHeaders(headers);
                                tmpModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                                tmpModel.setUseBatch(false);


                                var odataDocumentId = documentId;



                                try {
                                    // Post the document to the content server
                                    await new Promise((resolve, reject) => {
                                        tmpModel.create(`/AttachmentContentSet`, base64, {
                                            success: function (odata, responseData) {
                                                // Update progress
                                                displayValueForProgressIndicator += incrementForProgressIndicator;
                                                progressIndicator.setDisplayValue(Math.ceil(displayValueForProgressIndicator) + "%");
                                                progressIndicator.setPercentValue(Math.ceil(displayValueForProgressIndicator));


                                                odataDocumentId = responseData.DocumentId;

                                                resolve(); // Resolve the promise to indicate successful upload
                                            },
                                            error: function (odata, resp) {
                                                // Handle error
                                                reject(resp); // Reject the promise with the error response
                                            }
                                        });
                                    });


                                    //update DocumentID

                                    let updateDocIdPayload = {
                                        "dmsDocId": documentId,
                                        "dmsDocSystemId": 1,
                                        "docIdInSystem": `${odataDocumentId}`,
                                        "docSystemStatus": 9
                                    }


                                    this.fnProcessDataRequest(`MM_JAVA/updateDocIDInSystem`, "POST", updateDocIdPayload, true, null, function (responseData) {
                                        if (responseData) {

                                            // docCommentModel.setProperty("/documents/existingDoc",responseData.response);
                                            // docCommentModel.setProperty("/documents/attachmentcount", responseData?.response?.length);
                                            that.closeBusyDialog();
                                        }
                                    },
                                        function (responseData) {
                                            that.closeBusyDialog();
                                        });

                                } catch (error) {
                                    console.error("An error occurred during document upload:", error);
                                    // Handle specific error for this document upload if needed
                                }

                            },
                            function (responseData) {
                                that.closeBusyDialog();
                            })







                    }

                    // Close the dialog as progress is complete
                    this.oDefaultDialog.close();

                } catch (error) {
                    // Handle error
                }





            },

            fnPostComments: function (requestNumber, materialNumber, materialListId, modelName, comments, isCreateReqLevel = false, isDirectCommentFromCommentsTab = false) {
                if (!comments) {
                    return;
                }
                var oAppModel = this.getModelDetails("oAppModel"),
                    UserComments = oAppModel.getProperty("/GeneralData/UserComments"),
                    isWorkflowComment = UserComments?.isWorkflowComment,
                    postToRepository = UserComments?.postToRepository,
                    actionID = UserComments?.actionID,
                    actioni18nText = UserComments?.actioni18nText,
                    i18ActinText = this.geti18nText(actioni18nText),
                    that = this,
                    loggedInUserDetails = oAppModel.getData().userdetails,
                    loggedInUserEmail = loggedInUserDetails.userMailID,
                    currdate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                    url = "MM_JAVA/saveComments",
                    payload = {},
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    taskInstanceId = oAppModel.getProperty("/taskDetails/taskId"),
                    textPreceedingComment = "";
                if (isDirectCommentFromCommentsTab) {
                    textPreceedingComment = null;
                }
                else {
                    if (isWorkflowComment) {
                        let taskName = oAppModel.getProperty("/taskDetails/wfTaskName");
                        textPreceedingComment = `${taskName} : ${i18ActinText} - `;
                    }
                    else {
                        switch (actionID) {
                            case "exclude_system":
                            case "exclude_material":
                            case "commit_To_Repo":
                            case "syndicate_Material":
                                textPreceedingComment = `${i18ActinText} - `;
                                break;
                        }
                    }
                }
                if ((!comments) || (requestNumber != "" && requestNumber != undefined && requestNumber != null) || (materialNumber != "" && materialNumber != undefined && materialNumber != null)) {
                    payload = {
                        "comment": textPreceedingComment ? `${textPreceedingComment} ${comments}` : comments,
                        "commentID": null,
                        "commentedBy": loggedInUserEmail,
                        "commentedOn": currdate,
                        "lineNo": null,
                        "requestNumber": requestNumber,
                        "materialNumber": materialNumber,
                        "materialListId": materialListId,
                        "taskAction": null,
                        "taskInstanceId": taskInstanceId || null,
                        "taskName": wfTaskType || null,
                        "postToRepository": postToRepository || false,
                    };

                    this.fnProcessDataRequest(url, "POST", null, false, payload,
                        function (responsePayload) {
                            if (modelName == "CreateProject" && isCreateReqLevel != true) {
                                that.fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId(requestNumber, materialNumber, materialListId, modelName, true, isCreateReqLevel);
                            }
                            else if ((modelName == "CreateProject" || modelName == "CreateMassRequest") && isCreateReqLevel == true) {
                                that.fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId(requestNumber, materialNumber, materialListId, modelName, false, isCreateReqLevel);
                            }
                            else if (modelName == "Repository") {
                                that.fnGetCommentsByMaterialNumber(materialNumber, modelName);
                            } else { }

                        },
                        function (responsePayload) { })
                }
                else {
                    var errorMsg = this.resourceBundle.getText("invlaidRequestIdToStoreData");
                    this.showMessage(errorMsg, "E", ["OK"], "OK", function (action) {
                    });
                }
            },

            onClickShowDocumentSystemStatus: function (oEvent, dmsDocId) {
                let that = this,
                    oView = this.getView();

                var docCommentModel = this.getView().getModel("docCommentModel");


                //we get the dmsDocId from function parameter
                //we get the list of documents from model
                //filter with docId and get the systemData associated with this doc

                let listOfAllDocuments = docCommentModel.getProperty("/documents/existingDoc");
                let selectedDocument = listOfAllDocuments.filter(item => item.dmsDocID == dmsDocId);

                let oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems");

                var createProjectModel = this.getModelDetails("CreateProject"),
                    requestType = createProjectModel.getProperty("/RequestHeader/data/requestType");

                selectedDocument[0].systemData.map(function (sys) {
                    sys["markForSyndicationEnabled"] = that.fnCheckMarkForSyndicationEnability(sys.dmsDocSystemId, wfTaskType, selectedSystems, currentView, selectedDocument[0].documentSyndicationStatus, sys.docSystemStatus, requestType);
                })

                docCommentModel.setProperty("/documents/selectedDocument", selectedDocument[0]);


                this.LoadFragment("DocumentSystemStatus", oView);


            },

            fnCheckMarkForSyndicationEnability: function (systemId, wfTaskType, selectedSystems, currentView, documentSyndicationStatus, systemDcoStatus, requestType) {
                try {
                    if (currentView != "Repository" && wfTaskType && (wfTaskType === "Flex_WF_Task" || wfTaskType === "Request_Form_Submission")) {
                        return false;
                    } else if (currentView != "Repository" && documentSyndicationStatus == 9) {
                        return false;
                    }
                    let system = selectedSystems.find(sys => sys.MM_SYSTEM_ID == systemId);
                    let Repository = this.getModelDetails("Repository");

                    if (currentView === "Repository" && !Repository.getProperty("/MaterialSelected/documentEditability")) {
                        return false;
                    }

                    if (currentView != "Repository" && requestType == 6) return true;
                    if (currentView === "Repository" ? system?.repositorySystemStatusId == 9 : (system?.requestSystemStatusId == 9 || system?.repositorySystemStatusId == 9)) {
                        if (systemDcoStatus == 9) {
                            return false;
                        }
                        return true;
                    }
                    return false;
                } catch {
                    return true;
                }
            },

            onPressAddSystemToDocument: function (oEvent) {
                //get list of systems for this document
                //get list of systems present overall
                //show popover list of systems which are not present in that document

                var oButton = oEvent.getSource();

                let docCommentModel = this.getView().getModel("docCommentModel");
                let selectedDocument = docCommentModel.getProperty("/documents/selectedDocument");

                let listOfSystemsNotPresentInSelectedDocument = this.getListOfAbsentSystems(selectedDocument);

                //check if listOfSystemsNotPresentInSelectedDocument is not empty
                //show the popup

                if (listOfSystemsNotPresentInSelectedDocument.length > 0) {
                    let that = this,
                        oView = this.getView();

                    docCommentModel.setProperty("/documents/selectedDocument/listOfAbsentSystems", listOfSystemsNotPresentInSelectedDocument);

                    // create popover
                    if (!this._pPopover) {
                        this._pPopover = Fragment.load({
                            id: oView.getId(),
                            name: "com.viatris.materialmaster.fragments.Dialog.document.SelectSystemForDocument",
                            controller: this
                        }).then(function (oPopover) {
                            oView.addDependent(oPopover);
                            return oPopover;
                        });
                    }
                    this._pPopover.then(function (oPopover) {
                        oPopover.openBy(oButton);
                    });
                }

            },

            closePopupForAddSystemDocument: function () {
                this.getView().byId("id_SelectSystemForDocument").close();
            },

            onAddSystemForDocument: function (oEvent) {
                //get the selected system
                //get the document model array
                //push the system to the array in draft status
                //remove that system from popup list
                //close the popup


                let docCommentModel = this.getView().getModel("docCommentModel");
                let id_listOfSystemForDocument = this.getView().byId("id_listOfSystemForDocument");
                let listOfSelectedSystems = id_listOfSystemForDocument.getSelectedContextPaths();
                let selectedDocument = docCommentModel.getProperty("/documents/selectedDocument");
                let listOfAbsentSystems = docCommentModel.getProperty("/documents/selectedDocument/listOfAbsentSystems");

                for (let i = 0; i < listOfSelectedSystems.length; i++) {
                    let item = listOfSelectedSystems[i];
                    let lineSystemData = {
                        "markForSyndication": true,
                        "dmsDocSystemId": listOfAbsentSystems[item.split("listOfAbsentSystems/")[1]].MM_SYSTEM_ID,
                        "docSystemStatus": 1,
                    }
                    selectedDocument.systemData.push(lineSystemData);
                }

                selectedDocument.systemData.map(function (item) {
                    for (let i = 0; i < listOfAbsentSystems.length; i++) {
                        if (item.dmsDocSystemId == listOfAbsentSystems[i].MM_SYSTEM_ID) {
                            listOfAbsentSystems.splice(i, 1);
                        }
                    }
                })

                selectedDocument.listOfAbsentSystems = listOfAbsentSystems;

                docCommentModel.setProperty("/documents/selectedDocument", null);

                docCommentModel.setProperty("/documents/selectedDocument", selectedDocument);


                this.closePopupForAddSystemDocument();

            },

            getListOfAbsentSystems: function (selectedDocument) {

                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    listOfAllSystems = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/systemData");

                let listOfSystemsNotPresentInSelectedDocument = [];

                // Extract system IDs from the single selectedDocument object
                const selectedSystemIds = selectedDocument.systemData.map(system => system.dmsDocSystemId);

                // Filter systems not present in selectedDocument
                listOfSystemsNotPresentInSelectedDocument = listOfAllSystems.filter(system =>
                    !selectedSystemIds.includes(system.MM_SYSTEM_ID)
                );

                return listOfSystemsNotPresentInSelectedDocument;
            },

            onDeleteDraftDocument: function (oEvent) {
                //get the binded context of the document we want to delete
                //get the document array
                //remove the document from array
                //add the removed system back into the addSystem popover


                let docCommentModel = this.getView().getModel("docCommentModel");
                let selectedDocument = docCommentModel.getProperty("/documents/selectedDocument");
                let systemDataOfSelectedDocument = selectedDocument.systemData;
                let sPathOfDeletedSystem = oEvent.getSource().getParent().oBindingContexts.docCommentModel.sPath;
                let indexOfDeletedSystem = sPathOfDeletedSystem.split("systemData/")[1];
                let deletedSystem = systemDataOfSelectedDocument[indexOfDeletedSystem];
                systemDataOfSelectedDocument.splice(indexOfDeletedSystem, 1);
                // docCommentModel.setProperty("/documents/selectedDocument/systemData", systemDataOfSelectedDocument);

                let listOfAbsentSystems = this.getListOfAbsentSystems(selectedDocument);
                listOfAbsentSystems.push({ "MM_SYSTEM_ID": deletedSystem.dmsDocSystemId });

                selectedDocument.systemData = systemDataOfSelectedDocument;
                selectedDocument.listOfAbsentSystems = listOfAbsentSystems;

                docCommentModel.setProperty("/documents/selectedDocument", null);

                docCommentModel.setProperty("/documents/selectedDocument", selectedDocument);



            },

            onPressOkDocumentSystemStatus: function (oEvent) {
                //call the service to store updated files
                //close the fragment


                let docCommentModel = this.getView().getModel("docCommentModel");
                let selectedDocument = docCommentModel.getProperty("/documents/selectedDocument");
                var systemDataOfSelectedDocument = selectedDocument.systemData;
                let materialListId = this.getModelDetails("CreateProject").getProperty("/MaterialList/selectedMaterialData/materialListId");
                let payload = [];
                var that = this;

                payload = [{
                    "dmsDocID": selectedDocument.dmsDocID,
                    "documentId": selectedDocument.documentId,
                    "materialNumber": selectedDocument.materialNumber,
                    "mmDmsDocsSystemInfoDto": [],
                    // "postToRepository": true,
                    "documentSyndicationStatus": selectedDocument.documentSyndicationStatus,
                    "requestNumber": selectedDocument.requestNumber,
                    "taskAction": selectedDocument.taskAction,
                    "taskInstanceId": selectedDocument.taskInstanceId,
                    "taskName": selectedDocument.taskName
                }]

                systemDataOfSelectedDocument.map(function (item) {
                    let lineSystemData = {
                        "dmsDocId": selectedDocument.dmsDocID,
                        "dmsDocSystemId": item.dmsDocSystemId,
                        "docIdInSystem": item.docIdInSystem,
                        "docSystemStatus": item.docSystemStatus,
                        "markForSyndication": item.markForSyndication
                    }
                    payload[0].mmDmsDocsSystemInfoDto.push(lineSystemData);
                })

                let url = "MM_JAVA/updateDoc";
                let oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView");
                //debugger;
                if (currentView == "Repository") {
                    url = "MM_JAVA/updateDocRepo"
                }


                this.fnProcessDataRequest(url, "POST", null, true, payload,
                    function (responseData) {
                        that.closeBusyDialog();
                        docCommentModel.setProperty("/documents/selectedDocument", {});

                        if (currentView == "Repository") {
                            let Repository = that.getModelDetails("Repository"),
                                materialNumber = Repository.getProperty("/MaterialSelected/materialNumber");
                            that.fnGetRepositoryDocumentsByMaterialNumber(materialNumber);
                        } else {
                            that.onGetAttachmentByMaterialListId(materialListId, "CreateProject");
                        }
                    },
                    function (responseData) {
                    });

                this.onCloseDocumentSystemStatus();


            },

            onCloseDocumentSystemStatus: function () {
                this.byId("id_DocumentSystemStatus").close();
            },

            UploadComplete: function (oEvent) {
                let oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView");
                if (currentView == "Repository") {
                    this.fnUploadComplete("Repository", oEvent, "fileUploader");
                }
                else{
                    this.fnUploadComplete("CreateProject", oEvent, "fileUploader");
                }
            },

            onUploadFileAttach: function (oEvent) {
                let requestNumber = this.onGetRequestNo(),
                    CreateProject = this.getModelDetails("CreateProject"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    materialNumber = null,
                    modelName = "CreateProject";
                var oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView");
                if (currentView == "Repository") {
                    var Repository = this.getModelDetails("Repository");
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber");
                    modelName = "Repository";
                }
                this.fnUploadFileAttach(modelName, requestNumber, materialNumber, materialListId);
            },

            onDownloadDocumentFile: function (oEvent) {
                this.openBusyDialog();
                this.fnDownloadFileContent(oEvent, "docCommentModel");
            },

            onDeleteDocument: function (oEvent) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    requestNumber = this.onGetRequestNo(),
                    materialNumber = null;
                let oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView");
                if (currentView == "Repository") {
                    let Repository = this.getModelDetails("Repository");
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber");
                    materialListId = null;
                }
                this.fnDeleteDocument(requestNumber, materialNumber, materialListId, oEvent, "CreateProject");
            },

            onPostComments: function (oEvent) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    comments = oEvent.getParameter("value"),
                    requestNumber = this.onGetRequestNo(),
                    isReqLevel = false,
                    isDirectCommentFromCommentsTab = true,
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId");
                this.fnPostComments(requestNumber, null, materialListId, "CreateProject", comments, isReqLevel, isDirectCommentFromCommentsTab);
            },

            fnCheckDocumentToSyndicate: function () {
                let docCommentModel = this.getView().getModel("docCommentModel");
                let existingDoc = docCommentModel.getProperty("/documents/existingDoc");
                let flag = false;

                existingDoc.map(function (item) {
                    if (item.documentSyndicationStatus == 9) {
                        return;
                    }
                    item.systemData.map(function (sysData) {

                        if (sysData.markForSyndication && !sysData.docIdInSystem && item.included) {
                            flag = true;

                        }
                    })
                })

                return flag || false;
            },

            onPressSyndicateDocument: function (oEvent) {
                //show popup of list of documents along with there respective added systems
                //arrange the data in a way to show each document and each system

                let docCommentModel = this.getView().getModel("docCommentModel");
                let existingDoc = docCommentModel.getProperty("/documents/existingDoc");

                let oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView");

                let syndicateDocument = [];

                existingDoc.map(function (item) {

                    item.systemData.map(function (sysData) {
                        if (sysData.markForSyndication && !sysData.docIdInSystem && (currentView == "Repository" || item.included)) {
                            let lineDocument = {
                                "documentName": item.documentName,
                                "systemId": sysData.dmsDocSystemId,
                                "dmsDocId": sysData.dmsDocId,
                                "docIdInSystem": sysData.docIdInSystem,
                                "docSystemStatus": sysData.docSystemStatus,
                                "markForSyndication": sysData.markForSyndication,
                                "updatedOn": item.updatedOn,
                                "updatedBy": item.updatedBy,
                                "included": item.included
                            };

                            syndicateDocument.push(lineDocument);
                        }
                    })
                })

                docCommentModel.setProperty("/documents/syndicateDocumentList", syndicateDocument);


                this.LoadFragment("DocumentSyndicationSummary", this.getView());
            },

            fnHandleSyndication: function (oEvent) {
                //loop through each document
                //make promise for each odata syndication
                //if syndicated properly--> resolve with documentId received from odata
                //if syndication failed---> resolve with documentId as
                //whatever we will receive in promise--> get the documentId and set it in json payload
                //store all promises in container
                //after all promises resolve--> run a loop to update the status at document level after checking if any of the system is syndicated--> then update the status of document as syndicated as well
                //after updating status of all document--> post the payload to update in java


                let docCommentModel = this.getView().getModel("docCommentModel");
                let existingDoc = docCommentModel.getProperty("/documents/existingDoc");
                let materialNumber = this.fnGetMaterialDetailsSelectedData("materialNumber");
                let materialListId = this.fnGetMaterialDetailsSelectedData("materialListId");
                var that = this;

                let MaterialDetails = this.getModelDetails("MaterialDetails");

                let targetSystemIdObject = {};

                let selectedSystem = MaterialDetails.getProperty("/SystemData/selectedSystems");
                selectedSystem.map(function (item) {
                    targetSystemIdObject[item.MM_SYSTEM_ID] = item.MM_TARGET_SYSTEM_MATERIAL_ID;
                })

                let oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView");
                if (currentView == "Repository") {
                    let Repository = this.getModelDetails("Repository");
                    materialNumber = Repository.getProperty("/MaterialSelected/materialNumber");
                    materialListId = null;
                }

                this.openBusyDialog();

                // let documentList = [];
                // documentList = this.fnFlattenExistingDoc(existingDoc);
                let listOfDocId = [];
                let listOfDocId_gep = [];
                let listOfDocId_rp1 = [];
                let isGepPresent = false;
                let isRp1Present = false;

                const promises = existingDoc.map(function (doc) {
                    if (currentView == "Repository" || doc.included) {
                        const itemPromises = doc.systemData.map(function (item) {
                            return that.fnGetDocDetails(doc.dmsDocID, doc.documentId).then(res => {
                                if (!item.docIdInSystem && item.markForSyndication) {
                                    return that.fnPostDocument(targetSystemIdObject[item.dmsDocSystemId] ? targetSystemIdObject[item.dmsDocSystemId] : materialNumber, doc, item.dmsDocSystemId, res).then(docId => {
                                        listOfDocId.push(docId);
                                        if (item.dmsDocSystemId == 1) {
                                            listOfDocId_gep.push(docId);
                                            isGepPresent = true;
                                        }
                                        if (item.dmsDocSystemId == 2) {
                                            listOfDocId_rp1.push(docId);
                                            isRp1Present = true;
                                        }
                                        item.docIdInSystem = docId;
                                        if (!docId) item.docSystemStatus = 11;
                                        else {
                                            item.docSystemStatus = 9;
                                            doc.documentSyndicationStatus = 9;
                                        }
                                    })

                                }
                            })
                        })

                        return Promise.all(itemPromises).then(() => {

                        })

                    }


                })

                Promise.all(promises).then(() => {

                    let updateDocIdPayload = [];
                    existingDoc.map(function (item) {
                        let lineDoc = {
                            "dmsDocID": item.dmsDocID,
                            "documentId": item.documentId,
                            "materialNumber": item.materialNumber,
                            "mmDmsDocsSystemInfoDto": item.systemData,
                            // "postToRepository": true,
                            "documentSyndicationStatus": item.documentSyndicationStatus,
                            "requestNumber": item.requestNumber,
                            "taskAction": item.taskAction,
                            "taskInstanceId": item.taskInstanceId,
                            "taskName": item.taskName
                        }

                        updateDocIdPayload.push(lineDoc);
                    })
                    let url = "MM_JAVA/updateDoc";
                    let oAppModel = that.getModelDetails("oAppModel"),
                        currentView = oAppModel.getProperty("/sideNavigation/currentView");
                    //debugger;
                    if (currentView == "Repository") {
                        url = "MM_JAVA/updateDocRepo"
                    }
                    that.fnProcessDataRequest(url, "POST", null, true, updateDocIdPayload, function (responseData) {
                        if (responseData) {
                            that.closeBusyDialog();
                            if (currentView == "Repository") {
                                that.fnGetRepositoryDocumentsByMaterialNumber(materialNumber);
                            } else {
                                that.onGetAttachmentByMaterialListId(materialListId, "CreateProject");
                            }

                            let requestType = that.fnGetRequestHeaderData("requestType");

                            let arr = listOfDocId.filter(d => d == null);
                            let arr_gep = listOfDocId_gep.filter(d => d == null);
                            let arr_rp1 = listOfDocId_rp1.filter(d => d == null);
                            let documentSydicationMsg = "";
                            if (isGepPresent && !isRp1Present) {
                                documentSydicationMsg = (listOfDocId_gep.length - arr_gep.length) + " " + that.resourceBundle.getText("documentSyndicatedSuccessfullyInGep");
                            } else if (!isGepPresent && isRp1Present) {
                                documentSydicationMsg = (listOfDocId_rp1.length - arr_rp1.length) + " " + that.resourceBundle.getText("documentSyndicatedSuccessfullyInNED");
                            } else if (isGepPresent && isRp1Present) {
                                documentSydicationMsg = (listOfDocId_gep.length - arr_gep.length) + " " + that.resourceBundle.getText("documentSyndicatedSuccessfullyInGep") + " & " + (listOfDocId_rp1.length - arr_rp1.length) + " " + that.resourceBundle.getText("documentSyndicatedSuccessfullyInNED");
                            }

                            let successMsg,
                                actions = ["OK"];
                            successMsg = arr.length == listOfDocId.length ? that.resourceBundle.getText("documentSyndicationFailed") : documentSydicationMsg;
                            that.showMessage(successMsg, "S", actions, "OK", function (action) {
                                if (action == "OK") {
                                    if (requestType == 2 || requestType == 3 || requestType == 6) {
                                        that.onGetClaimTask();
                                    }
                                }

                            });

                        }
                    },
                        function (responseData) {
                            that.closeBusyDialog();
                        });
                })

            },

            fnGetDocDetails: function (documentId, docId) {
                return new Promise(res => {
                    let oAppModel = this.getModelDetails("oAppModel"),
                        currentView = oAppModel.getProperty("/sideNavigation/currentView");
                    let url = "MM_JAVA/file/download/" + documentId,
                        that = this;

                    if (currentView == "Repository") {
                        url = "MM_JAVA/file/downloadRepo/" + docId
                    }

                    this.fnProcessDataRequest(url, "GET", null, false, null,
                        function (responseData) {
                            res(responseData);
                        },
                        function (responseData) {
                            res(responseData);
                        })
                })

            },

            fnPostDocument: function (materialNumber, doc, systemId, responseData) {
                return new Promise(async resolve => {
                    var tmpModel;
                    if (systemId == 1)
                        tmpModel = this.getOwnerComponent().getModel("oDocumentModel");
                    else
                        tmpModel = this.getOwnerComponent().getModel("oDocumentModelNED");
                    let fileName = doc.documentName;
                    let lastDotIndex = fileName.lastIndexOf(".");


                    var encodedFileContent = responseData?.data?.encodedFileContent;

                    let fileNameBeforeExtension, fileExtension;
                    if (lastDotIndex !== -1) {
                        fileNameBeforeExtension = fileName.substring(0, lastDotIndex);
                        fileExtension = fileName.substring(lastDotIndex + 1);
                    } else {
                        fileNameBeforeExtension = fileName;
                        fileExtension = '';
                    }

                    const encodedMaterialNumber = encodeURI(materialNumber);
                    const encodedFileName = encodeURI(fileNameBeforeExtension);
                    const encodedFileExtension = encodeURI(fileExtension);
                    const base64 = encodedFileContent;
                    const slug = `${encodedMaterialNumber}:${encodedFileName}:${encodedFileExtension}`;


                    const headers = {
                        "slug": slug,
                        "Content-Type": "application/json;odata=verbose"
                    };

                    // Set headers and other configurations for the model
                    tmpModel.setHeaders(null);
                    tmpModel.setHeaders(headers);
                    tmpModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
                    tmpModel.setUseBatch(false);

                    var documentId = doc.documentId;
                    var odataDocumentId = documentId;

                    try {
                        // Post the document to the content server

                        tmpModel.create(`/AttachmentContentSet`, base64, {
                            success: function (odata, responseData) {
                                odataDocumentId = responseData.DocumentId;
                                resolve(responseData.data.DocumentId); // Resolve the promise to indicate successful upload
                            },
                            error: function (odata, resp) {
                                // Handle error
                                resolve(null); // Reject the promise with the error response
                            }
                        });

                    } catch (error) {
                        console.error("An error occurred during document upload:", error);
                        // Handle specific error for this document upload if needed
                        resolve(null);
                    }

                })
            },

            fnFlattenExistingDoc: function (existingDoc) {
                //debugger;
                let documentList = [];

                // existingDoc.map(item=>{
                //     // documentList.push(existingDoc);
                //     // delete documentList["systemData"];
                //     item.systemData.map(sysData=>{
                //         documentList.push(item);
                //         delete documentList["systemData"];
                //         documentList["systemData"]=[];
                //         documentList["systemData"].push(sysData);
                //     })
                // })

                for (let i = 0; i < existingDoc.length; i++) {
                    for (let j = 0; j < existingDoc[i].systemData.length; j++) {
                        documentList.push(existingDoc[i]);
                        delete documentList[i]["systemData"];
                        documentList[i]["systemData"] = [];
                        documentList[i]["systemData"].push = existingDoc[i].systemData[j];
                    }
                }

                return documentList;
            },

            fnToExcludeDocument: function (oEvent) {
                let selected = oEvent.getParameters().selected,
                    bindingPath = oEvent.getSource().getBindingContext("docCommentModel").sPath,
                    CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    that = this;
                MaterialDetails.setProperty("/GeneralData/bindingPathForExcludedDocument", bindingPath);
                this.openBusyDialog();
                if (materialListId && !selected) {
                    let actions = ["NO", "YES"],
                        confirmationMsg = this.resourceBundle.getText("excludeDocumentConfirmation");
                    CreateProject.setProperty(bindingPath + "/included", true);
                    that.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                            let actionID = "exclude_document";
                            that.onOpenCommentsPopScreen(actionID, false);
                        }
                        else {
                            // Don't update the included flag - if user press NO button on confirmation
                            MaterialDetails.setProperty(bindingPath + "/included", true);
                            that.closeBusyDialog();
                        }
                    });
                } else {
                    this.closeBusyDialog();
                }
            },

            fnToExcludeDoc: function () {
                let that = this,
                    CreateProject = this.getModelDetails("CreateProject"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    materialNumber = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialNumber"),
                    docCommentModel = this.getView().getModel("docCommentModel"),
                    selectedPath = MaterialDetails.getProperty("/GeneralData/bindingPathForExcludedDocument"),
                    requestNumber = this.fnGetRequestHeaderData("requestNumber"),
                    selectedIndex = parseInt(selectedPath.split('/').pop(10)),
                    dmsDocId = docCommentModel.getProperty(selectedPath + "/dmsDocID"),
                    requestPayload = {
                        "materialListId": materialListId || null,
                        "materialNumber": materialNumber || null,
                        "dmsDocId": dmsDocId || null,
                        "requestNumber": requestNumber
                    },
                    url = `MM_JAVA/updateIncludeFlagDmsDoc`;
                that.fnProcessDataRequest(url, "POST", null, true, requestPayload,
                    function (responseData) {
                        if (responseData?.statusCode === "200") {
                        }
                        that.closeBusyDialog();
                    },
                    function (responseData) { })
            },

            onPressOkDocumentSyndicationSummary: function (oEvent) {
                this.fnHandleSyndication(oEvent);
                this.onCloseDocumentSyndicationSummary();
            },

            onCloseDocumentSyndicationSummary: function () {
                this.getView().byId("id_DocumentSyndicationSummary").close();
            },

            onChangeMarkForSyndicationDocumentSystem: function (oEvent) {
                let state = oEvent.getSource().getState(),
                    sPath = oEvent.getSource().getParent().getBindingContext("docCommentModel").sPath,
                    docCommentModel = this.getView().getModel("docCommentModel"),
                    system;
                system = docCommentModel.getProperty(sPath).dmsDocSystemId;

                if (state) {
                    let confirmationMsg = this.resourceBundle.getText("enableForSyndication"),
                        actions = ["NO", "YES"],
                        that = this;

                    this.showMessage(confirmationMsg, "Q", actions, "YES", function (action) {
                        if (action === "YES") {
                        }
                        else {
                            docCommentModel.setProperty(sPath + "/markForSyndication", !state);
                        }
                    });
                }
                else {
                    let confirmationMsg = this.resourceBundle.getText("disbleForSyndication"),
                        actions = ["NO", "YES"],
                        that = this;

                    this.showMessage(confirmationMsg, "Q", actions, "YES", async function (action) {
                        if (action === "YES") { }
                        else {
                            docCommentModel.setProperty(sPath + "/markForSyndication", !state);
                        }
                    });

                }
            },


            //Cases

            onClickAddNewCases: function (oEvent) {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    newCase = {
                        "scenario": "add",
                        "caseId": "",
                        "caseType": "",
                        "comment": "",
                        "followUpDate": null,
                        "resolvedDate": null,
                        "caseStatus": "1"
                    };
                // this.onLoadingAlternateIdData();
                var caseData = {};
                var caseModel = this.getView().getModel("caseModel");
                if (!caseModel) {
                    caseModel = new JSONModel();
                    this.getView().setModel(caseModel, "caseModel");
                }

                caseData.newCase = newCase;
                caseModel.setProperty("/newCase", newCase);
                // caseModel.setData(caseData);
                caseModel.refresh(true);

                var that = this;

                this.fnClearAllErrorStateBeforeOpeningAddCaseDialog();

                this.LoadFragment("AddNewCase", oView, true).then(() => {
                    that.fnSetMinDateForFollowUpDate();
                })
            },

            onCancelCaseId: function (oEvent) {
                this.byId("id_AddNewCase").close();
            },

            checkMandatoryCaseFields: function (newCase) {
                const setErrorState = (fieldId, fieldName) => {
                    this.getView().byId(fieldId).setValueState("Error");
                    this.getView().byId(fieldId).setValueStateText(`${fieldName} is a mandatory field`);
                };

                const mandatoryFields = (status, fields) => {
                    let isValid = true;
                    fields.forEach(({ field, id, name }) => {
                        if (!newCase[field]) {
                            setErrorState(id, name);
                            isValid = false;
                        }
                    });
                    return isValid;
                };

                if (newCase.caseStatus == 1) {
                    return mandatoryFields("1", [
                        { field: 'caseType', id: "id_caseType", name: "Case Type" },
                        { field: 'comment', id: "id_caseComment", name: "Case Comment" },
                        { field: 'followUpDate', id: "id_caseFollowUpDate", name: "Follow-Up Date" }
                    ]);
                } else if (newCase.caseStatus == 2) {
                    return mandatoryFields("2", [
                        { field: 'caseType', id: "id_caseType", name: "Case Type" },
                        { field: 'comment', id: "id_caseComment", name: "Case Comment" },
                        { field: 'resolvedDate', id: "id_caseResolvedDate", name: "Resolved Date" }
                    ]);
                }
            },

            fnSetMinDateForFollowUpDate: function () {
                if (this.getView().byId("id_caseFollowUpDate")) this.getView().byId("id_caseFollowUpDate").setMinDate(new Date());
            },

            fnClearAllErrorStateBeforeOpeningAddCaseDialog: function (oEvent) {
                if (this.getView().byId("id_caseType")) this.getView().byId("id_caseType").setValueState(null);
                if (this.getView().byId("id_caseComment")) this.getView().byId("id_caseComment").setValueState(null);
                if (this.getView().byId("id_caseFollowUpDate")) this.getView().byId("id_caseFollowUpDate").setValueState(null);
                if (this.getView().byId("id_caseResolvedDate")) this.getView().byId("id_caseResolvedDate").setValueState(null);
            },

            fnAddNewCaseData: function (oEvent) {
                var caseModel = this.getView().getModel("caseModel"),
                    caseList = caseModel.getProperty("/caseList"),
                    isUpdateFlag = false;
                if (!caseList) caseList = [];
                this.onPostCase(isUpdateFlag);
            },

            fnUpdateExistingCaseData: function (oEvent) {
                var caseModel = this.getView().getModel("caseModel"),
                    selectedPath = caseModel.getProperty("/selectedPath"),
                    updatedCase = caseModel.getProperty("/newCase"),
                    isUpdateFlag = true;
                caseModel.setProperty(selectedPath, updatedCase);
                this.onPostCase(isUpdateFlag);

            },

            onClickEditCase: function (oEvent) {
                var caseModel = this.getView().getModel("caseModel"),
                    clickedObject = oEvent?.getSource()?.getParent()?.getBindingContext("caseModel")?.getObject(),
                    sPath = oEvent?.getSource()?.getParent()?.getBindingContext("caseModel")?.sPath,
                    oView = this.getView(),
                    caseObject = JSON.parse(JSON.stringify(clickedObject));
                caseObject = { ...caseObject, ...clickedObject };
                caseObject.scenario = "edit";
                caseModel.setProperty("/newCase", caseObject);
                caseModel.setProperty("/selectedPath", sPath);

                this.fnClearAllErrorStateBeforeOpeningAddCaseDialog();
                this.LoadFragment("AddNewCase", oView, true);
            },

            onPostCase: function (isUpdateFlag, oEvent) {
                let CreateProject = this.getModelDetails("CreateProject"),
                    requestNumber = this.onGetRequestNo(),
                    materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
                    materialNumber = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialNumber");


                var oAppModel = this.getModelDetails("oAppModel"),
                    loggedInUserDetails = oAppModel?.getData()?.userdetails,
                    loggedInUserEmail = loggedInUserDetails?.userMailID,
                    taskInstanceId = oAppModel.getProperty("/taskDetails/taskId"),
                    taskName = oAppModel.getProperty("/taskDetails/wfTaskName"),
                    caseModel = this.getView().getModel("caseModel"),
                    newCase = caseModel.getProperty("/newCase"),
                    // oldCaseList = JSON.parse(JSON.stringify(caseModel.getProperty("/caseList")));
                    oldCaseList = caseModel.getProperty("/oldCaseList");

                let areAllMandatoryFieldsFilled = this.checkMandatoryCaseFields(newCase);

                if (areAllMandatoryFieldsFilled) {

                    this.onCancelCaseId();


                    let currdate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss"),
                        caseMappedPayload = [
                            {
                                "caseId": isUpdateFlag ? (newCase?.caseId) : null,
                                "caseStatus": newCase?.caseStatus,
                                "caseType": newCase?.caseType,
                                "changedBy": isUpdateFlag ? loggedInUserEmail : null,
                                "changedOn": isUpdateFlag ? currdate : null,
                                "comments": newCase?.comment,
                                "createdBy": (isUpdateFlag) ? (newCase?.createdBy) : loggedInUserEmail,
                                "createdOn": (isUpdateFlag) ? (newCase?.createdOn) : currdate,
                                "followUpDate": (newCase?.followUpDate) ? newCase.followUpDate + " 00:00:00" : null,
                                "materialListId": materialListId,
                                "materialNumber": materialNumber,
                                "requestNumber": requestNumber,
                                "resolvedDate": (newCase?.resolvedDate) ? newCase.resolvedDate + " 00:00:00" : null,
                                "taskAction": null,
                                "taskInstanceId": taskInstanceId,
                                "taskName": taskName
                            }
                        ],

                        url = "MM_JAVA/saveCaseData",
                        that = this,

                        payload = {
                            "oldCaseList": (oldCaseList?.length) ? oldCaseList : null,
                            "newCaseList": caseMappedPayload
                        }

                    this.fnProcessDataRequest(url, "POST", null, true, payload,
                        async function (responsePayload) {
                            await that.fnGetAllCases(requestNumber, materialNumber, materialListId);
                            that.onGetFilteredDataMatChangeLog("CreateProject", false);


                        },
                        function (responsePayload) { })

                } else {

                }


            },

            // onUpdateCase: function (oEvent) {
            //     let CreateProject = this.getModelDetails("CreateProject"),
            //         requestNumber = this.onGetRequestNo(),
            //         materialListId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId"),
            //         materialNumber = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialNumber");


            //     var oAppModel = this.getModelDetails("oAppModel"),
            //         loggedInUserDetails = oAppModel.getData().userdetails,
            //         loggedInUserEmail = loggedInUserDetails.userMailID,
            //         taskInstanceId = oAppModel.getProperty("/taskDetails/taskId"),
            //         taskName = oAppModel.getProperty("/taskDetails/wfTaskName");

            //     var currdate = this.onGetCurrentDate("yyyy-mm-dd HH:mm:ss");


            //     var caseModel = this.getView().getModel("caseModel");
            //     var newCase = caseModel.getProperty("/newCase");
            //     var payload = [
            //         {
            //             "caseId": newCase.caseId,
            //             "caseStatus": newCase.caseStatus,
            //             "caseType": newCase.caseType,
            //             "changedBy": loggedInUserEmail,
            //             "changedOn": currdate,
            //             "comments": newCase.comment,
            //             "createdBy": newCase.createdBy,
            //             "createdOn": newCase.createdOn,
            //             "followUpDate": newCase.followUpDate ? newCase.followUpDate + " 00:00:00" : null,
            //             "materialListId": materialListId,
            //             "materialNumber": materialNumber,
            //             "requestNumber": requestNumber,
            //             "resolvedDate": newCase.resolvedDate ? newCase.resolvedDate + " 00:00:00" : null,
            //             "taskAction": null,
            //             "taskInstanceId": taskInstanceId,
            //             "taskName": taskName
            //         }
            //     ];

            //     var url = "MM_JAVA/updateCaseData";
            //     var that = this;

            //     let areAllMandatoryFieldsFilled = this.checkMandatoryCaseFields(newCase);

            //     if (areAllMandatoryFieldsFilled) {

            //         this.onCancelCaseId();

            //         this.fnProcessDataRequest(url, "PUT", null, true, payload,
            //             function (responsePayload) {
            //                 var url1 = "MM_JAVA/getAllCaseData";
            //                 var payload1 = {
            //                     "materialListId": materialListId,
            //                     "materialNumber": materialNumber,
            //                     "requestNumber": requestNumber
            //                 }
            //                 that.fnProcessDataRequest(url1, "POST", null, true, payload1,
            //                     function (responsePayload) {

            //                         var caseList = [];

            //                         responsePayload.map(function (item) {
            //                             let followUpDate = item.followUpDate.slice(0, 10);
            //                             let resolvedDate = item.resolvedDate.slice(0, 10);
            //                             var lineCaseItem = {
            //                                 "caseId": item.caseId,
            //                                 "caseStatus": item.caseStatus,
            //                                 "caseType": item.caseType,
            //                                 "changedBy": item.changedBy,
            //                                 "changedOn": item.changedOn,
            //                                 "comment": item.comments,
            //                                 "createdBy": item.createdBy,
            //                                 "createdOn": item.createdOn,
            //                                 "followUpDate": followUpDate,
            //                                 "materialListId": item.materialListId,
            //                                 "materialNumber": item.materialNumber,
            //                                 "requestNumber": item.requestNumber,
            //                                 "resolvedDate": resolvedDate
            //                             }

            //                             caseList.push(lineCaseItem);
            //                         })

            //                         caseModel.setProperty("/caseList", caseList);
            //                         caseModel.setProperty("/totalCases", responsePayload.length);
            //                         that.closeBusyDialog();

            //                     },
            //                     function (responsePayload) { })

            //             },
            //             function (responsePayload) { })
            //     } else {

            //     }
            // },

            fnGetAllCases: function (requestNumber, materialNumber, materialListId) {
                var caseModel = this.getView().getModel("caseModel");
                if (!caseModel) {
                    caseModel = new JSONModel();
                    this.getView().setModel(caseModel, "caseModel");
                }
                var that = this;
                var url = "MM_JAVA/getAllCaseData";
                var payload1 = {
                    "materialListId": materialListId,
                    "materialNumber": materialNumber,
                    "requestNumber": requestNumber
                }
                that.fnProcessDataRequest(url, "POST", null, true, payload1,
                    function (responsePayload) {

                        caseModel.setProperty("/oldCaseList", JSON.parse(JSON.stringify(responsePayload)));

                        var caseList = [];

                        responsePayload.map(function (item) {
                            let followUpDate = item?.followUpDate?.slice(0, 10),
                                resolvedDate = item?.resolvedDate?.slice(0, 10);
                            var lineCaseItem = {
                                "caseId": item?.caseId,
                                "caseStatus": item?.caseStatus,
                                "caseType": item?.caseType,
                                "changedBy": item?.changedBy,
                                "changedOn": item?.changedOn,
                                "comment": item?.comments,
                                "createdBy": item?.createdBy,
                                "createdOn": item?.createdOn,
                                "followUpDate": followUpDate,
                                "materialListId": item?.materialListId,
                                "materialNumber": item?.materialNumber,
                                "requestNumber": item?.requestNumber,
                                "resolvedDate": resolvedDate
                            }

                            caseList.push(lineCaseItem);
                        })

                        caseModel.setProperty("/caseList", caseList);
                        caseModel.setProperty("/totalCases", responsePayload?.length);
                        that.closeBusyDialog();

                    },
                    function (responsePayload) { })
            },

            fnShowDialogForOpenCasesWhenCompleteTask: function (oEvent) {
                var that = this,
                    isMandatClassification = this.fnClassFieldsEmptyValidCheck();

                if (isMandatClassification != true) {
                    let modifiedClass = that.geti18nText("modifiedClass"),
                        classMandErrorMsg = that.geti18nText("classMandErrorMsg"),
                        proceedConfirmMsg = that.geti18nText("proceedConfirmMsg"),
                        errMsg = isMandatClassification?.map(item =>
                            `${item.systemId}: ${classMandErrorMsg} ${modifiedClass} ${item.className}`
                        ).join('\n\n');
                    MessageBox.error(errMsg, {
                        actions: [MessageBox.Action.CANCEL],
                        onClose: function (action) {
                            // if (action === MessageBox.Action.OK) {
                            //     that.fnToTriggerCompleteRequest(oEvent);
                            // }
                        }
                    });
                } else {
                    this.fnToTriggerCompleteRequest(oEvent);
                }
            },

            fnToTriggerCompleteRequest: function (oEvent) {
                var caseModel = this.getView().getModel("caseModel");
                var caseList = caseModel?.getProperty("/caseList");
                if (!caseList) caseList = [];
                var that = this;

                let caseCount = 0;
                caseList.map(function (item) {
                    if (item.caseStatus == 1) caseCount++;
                })

                if (caseCount > 0) {
                    let errMsg = `There are ${caseCount} open cases.`;
                    that.showMessage(errMsg, "W", ["COMPLETEREQUEST", "CANCEL"], "OK", function (action) {
                        if (action === "Complete Request") {
                            that.onCompleteRequestTask();
                        } else if (action === "Cancel") {
                            that.closeBusyDialog();
                        }
                    });
                } else {
                    that.onCompleteRequestTask();
                }
            },

            // Request Side
            fnGetCommentsByRequestNumberOrMaterialNumberOrMaterialListId: function (requestNo, materialNo, materialListId, modelName, showMaterialLevelCommentFlag, isCreateReqLevel) {
                var modelDetails = this.getModelDetails(modelName),
                    that = this,
                    url = "MM_JAVA/getCommentByRequestNumberOrMaterialNumberOrMaterialListId",
                    getCommentsPayload = {
                        "materialListId": materialListId,
                        "requestNumber": requestNo,
                        "materialNumber": materialNo,
                        "showMaterialLevelComments": showMaterialLevelCommentFlag
                    };
                this.fnProcessDataRequest(url, "POST", null, false, getCommentsPayload,
                    function (responsePayload) {
                        if (isCreateReqLevel == true) {
                            modelDetails.setProperty("/DocComments/reqLevelComments/existingComments", responsePayload?.result?.mmCommentsDto);
                            modelDetails.setProperty("/DocComments/reqLevelComments/totalcomments", responsePayload?.result?.totalCount);
                        } else {
                            modelDetails.setProperty("/DocComments/comments/existingComments", responsePayload?.result?.mmCommentsDto);
                            modelDetails.setProperty("/DocComments/comments/totalcomments", responsePayload?.result?.totalCount);
                        }
                        that.onUpdateNewDocCommentModel(modelName);
                    },
                    function (responsePayload) {
                    }
                )
            },

            // Repo Side
            fnGetCommentsByMaterialNumber: function (materialNumber, modelName) {
                var modelDetails = this.getModelDetails(modelName),
                    that = this,
                    url = "MM_JAVA/getCommentByMaterialNumber?materialNumber=" + materialNumber;

                this.fnProcessDataRequest(url, "GET", null, false, null,
                    function (responsePayload) {
                        modelDetails.setProperty("/DocComments/comments/existingComments", responsePayload?.result?.repoComments);
                        modelDetails.setProperty("/DocComments/comments/totalcomments", responsePayload?.result?.totalCount);
                        that.onUpdateNewDocCommentModel(modelName);
                    },
                    function (responsePayload) {
                    }
                )
            },

            fnGetRepositoryDocumentsByMaterialNumber: function (materialNumber) {
                var that = this,
                    docCommentModel = this.getView().getModel("docCommentModel");

                if (!docCommentModel) {
                    docCommentModel = new JSONModel();
                    this.getView().setModel(docCommentModel, "docCommentModel");
                }

                this.fnProcessDataRequest(`MM_JAVA/getDocumentsByMaterialNumber?materialNumber=${materialNumber}`, "GET", null, true, null, function (responseData) {
                    if (responseData) {

                        docCommentModel.setProperty("/documents/existingDoc", responseData.response);
                        docCommentModel.setProperty("/documents/attachmentcount", responseData?.response?.length);
                        that.closeBusyDialog();
                    }
                },
                    function (responseData) {
                        that.closeBusyDialog();
                    });
            },


            fnGetWfDetailsModelData: function (dataFor) {
                var oAppModel = this.getModelDetails("oAppModel"),
                    data = null;
                data = oAppModel.getProperty(`/taskDetails/${dataFor}`) || null;
                return data;
            },

            fnGetWFValidatedContext: function (materialType, requestType, requestNumber, viewSource) {
                return new Promise((resolve, reject) => {
                    var that = this,
                        LookupModel = this.getModelDetails("LookupModel"),
                        CreateProject = this.getModelDetails("CreateProject"),
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        currentUserMailID = this.fnGetCurrentUserMailID(),
                        WFValidationContxtPayload = {},
                        allmaterialType = LookupModel.getProperty("/materialType"),
                        allRequestType = LookupModel.getProperty("/requestType"),
                        wfTaskType = this.fnGetWfDetailsModelData("wfTaskType"),
                        materialTypeDesc = null,
                        requestTypeDesc = null;
                    try {
                        let mappedMaterialObj = allmaterialType.find(obj =>
                            obj.MM_KEY == materialType
                        );
                        materialTypeDesc = mappedMaterialObj.MM_MATERIAL_TYPE_SAP_CODE;

                        let mappedRequestObj = allRequestType.find(obj =>
                            obj.MM_KEY == requestType
                        );
                        requestTypeDesc = mappedRequestObj.MM_REQUEST_TYPE_DESCRIPTION;
                    } catch {
                    }
                    WFValidationContxtPayload = {
                        "creationFromWorkflowRequest": {
                            "materialName": "",
                            "materialType": materialType,
                            "materialTypeDesc": materialTypeDesc,
                            "requestNumber": requestNumber,
                            "requestType": requestType,
                            "requestTypeDesc": requestTypeDesc,
                            "systemId": "*",
                            "wfChangeRequestType": "*",
                            "wfTriggeredFrom": wfTaskType
                        },
                        "workflowConditionsDetail": {
                            "action": 0,
                            "completeWorkflow": false,
                            "sourceOfRequest": viewSource === "CreateProject" ? 1 : 2
                        },
                        "workflowTaskDetails": {
                            "gmdmApprover_RecipientUsers": null,
                            "gqdmApprover_RecipientUsers": null,
                            "requestor": currentUserMailID
                        }
                    };
                    this.openBusyDialog();
                    if ((requestType == 1 && wfTaskType == "Request_Form_Submission") || requestType == 4 || requestType == 5 || requestType == 7 || requestType == 8) {
                        this.fnProcessDataRequest("MM_JAVA/getWfContextValidation", "POST", {}, true, WFValidationContxtPayload,
                            function (oResponse) {
                                if (oResponse.responseData.errorMessage.length === 0) {
                                    //Workflow srv
                                    that.fnStartWorkflow(oResponse, viewSource);
                                    resolve(true);
                                }
                                else {
                                    let errMsg = oResponse.responseData.errorMessage[0];
                                    that.showMessage(errMsg, "E", ["OK"], "OK", function (action) {
                                        if (action === "OK") {
                                            if (requestType == "1") {
                                                that.navigateTo("RequestManagement");
                                            }
                                            else {
                                                that.navigateTo("MassRequest");
                                            }
                                            that.closeBusyDialog();
                                            resolve(true);
                                        }
                                    });
                                }

                            },
                            function (oError) {
                                resolve(false);
                                that.closeBusyDialog();
                            }
                        );
                    }
                    else {
                        let url;
                        if (requestType == 3) { //ModifyScenario
                            url = "MM_JAVA/getWfContextValidationForChange";
                            var isToSplitRequests = CreateProject.getProperty("/GeneralData/wfApproverChainRecalculateForModify/isToSplitRequests");
                            WFValidationContxtPayload.splitReq = isToSplitRequests;
                        }
                        else if (requestType == 2 || requestType == 6) { //ExtendScenario - Plant / System
                            url = "MM_JAVA/getWfContextValidationForExtend";
                            WFValidationContxtPayload.requestTypeRuleData = allRequestType;
                        }
                        else if (requestType == 1) { // For create at GMDM Task post systems syndication
                            let materialListID = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId");
                            url = "MM_JAVA/getWfContextValidationForCreate";
                            WFValidationContxtPayload.creationFromWorkflowRequest.materialListId = materialListID;
                            WFValidationContxtPayload.requestTypeRuleData = allRequestType;
                        }
                        this.fnProcessDataRequest(url, "POST", {}, true, WFValidationContxtPayload,
                            function (oResponse) {
                                if (oResponse?.responseStatus == 200) {
                                    if (requestType == 6 || requestType == 1) {
                                        MaterialDetails.setProperty("/GeneralData/wfContextAtGMDMTask", {
                                            "viewSource": viewSource,
                                            "response": oResponse
                                        });
                                        let workflowContextDto = oResponse?.workflowContextDto || [];
                                        if (workflowContextDto && workflowContextDto.length > 0) {
                                            that.fnhandleWorkflowForParallelRequests(oResponse, viewSource);
                                            resolve(true);
                                        }
                                        else {
                                            that.fnDirectPlantSync();
                                            resolve(true);
                                        }
                                    }
                                    else if (requestType == 3 && !isToSplitRequests) {
                                        CreateProject.setProperty("/GeneralData/wfApproverChainRecalculateForModify", {
                                            "resetContextData": oResponse?.workflowContextDto[0], // always it returns the one context from service in this scenario
                                            "isToSplitRequests": false,
                                            "isToUpdatedContext": true
                                        });
                                        resolve(true);
                                    }
                                    else {
                                        that.fnhandleWorkflowForParallelRequests(oResponse, viewSource);
                                        resolve(true);
                                    }
                                }
                                else {
                                    let errMsg = oResponse?.errorMessage[0];
                                    that.showMessage(errMsg, "E", ["OK"], "OK", function () {
                                    });
                                    that.closeBusyDialog();
                                    resolve(true);
                                }
                            },
                            function (oError) {
                                that.closeBusyDialog();
                            }
                        );
                    }
                });
            },

            fnhandleWorkflowForParallelRequests: function (oResponse, viewSource) {
                let oView = this.getView(),
                    CurrentModel = this.getModelDetails(viewSource),
                    workflowContextDto = oResponse?.workflowContextDto,
                    tableResponse = [],
                    errorExists = oResponse?.errorInContext;
                if (workflowContextDto) {
                    for (let contextObj of workflowContextDto) {
                        let errorMessage = null;
                        if (!contextObj?.responseData?.serviceExecutionSuccess) {
                            errorMessage = contextObj?.responseData?.errorMessage[0] || null;
                        }
                        tableResponse.push(
                            {
                                requestNumber: contextObj?.creationFromWorkflowRequest?.requestNumber,
                                validationStatus: contextObj?.responseData?.serviceExecutionSuccess,
                                errorMessage: errorMessage,
                                context: contextObj,
                                viewSource: viewSource,
                                attributeId: contextObj?.changeRequestDto?.fieldName
                            }
                        )
                    }
                    CurrentModel.setProperty("/WorkflowDetails/workflowGetContextResponse", tableResponse);
                    if (errorExists) {
                        this.LoadFragment("WfValidationSummary", oView, true);
                    }
                    else {
                        this.onTriggerParallelWorkflow();
                    }
                }
            },

            onTriggerParallelWorkflow: function () {
                let viewName = this.getViewName(),
                    CurrentModel = this.getModelDetails(viewName),
                    workflowGetContextResponse = CurrentModel.getProperty("/WorkflowDetails/workflowGetContextResponse"),
                    oView = this.getView(),
                    that = this;
                CurrentModel.setProperty("/wfParallelRequestResponses", []);
                for (let wfContextObj of workflowGetContextResponse) {
                    let context = wfContextObj.context,
                        viewSource = wfContextObj.viewSource;
                    if (wfContextObj?.validationStatus) {
                        that.fnStartWorkflow(context, viewSource);
                    }
                }
                let wfParallelRequestResponses = CurrentModel.getProperty("/wfParallelRequestResponses"), wfTriggeredInfo;
                if (wfParallelRequestResponses && wfParallelRequestResponses.length > 0) {
                    wfTriggeredInfo = wfParallelRequestResponses.map(response => ({
                        status: response?.successStatus ? that.geti18nText("workFlowTriggerSuccess") : that.geti18nText("workFlowTriggerFailure"),
                        msg: response.msg
                    }));
                    CurrentModel.setProperty("/wfParallelRequestResponses", wfTriggeredInfo);
                    if (viewName === "CreateProject") {
                        this.LoadFragment("WfTriggeredInfo", oView, true);
                    }
                }
                else {
                    this.closeBusyDialog();
                }
            },

            onPressOkValidationSummary: function () {
                let requestType = this.fnGetRequestHeaderData("requestType");
                if (requestType == 6) {
                    this.fnDirectPlantSync();
                }
                this.byId("id_WfValidationSummary").close();
            },

            getMassAttributeList: function (sUiViewKey) {
                if (sUiViewKey) {
                    let that = this,
                        CreateMassRequest = this.getModelDetails("CreateMassRequest"),
                        materialTypeId = CreateMassRequest.getProperty("/RequestHeader/data/materialType"),
                        requestTypeId = CreateMassRequest.getProperty("/RequestHeader/data/requestType"),
                        sUrl = "MM_JAVA/getAttributesList",
                        LookupModel = this.getModelDetails("LookupModel"), requestSource, oPayload;

                    if (requestTypeId == "4") {
                        requestSource = "Mass_Create"
                    } else if (requestTypeId == "5") {
                        requestSource = "Mass_Update"
                    }

                    oPayload = {
                        "materialTypeId": materialTypeId,
                        "uiView": sUiViewKey,
                        "requestSource": requestSource
                    };
                    that.openBusyDialog();
                    this.fnProcessDataRequest(sUrl, "POST", null, false, oPayload,
                        function (responseData) {
                            LookupModel.setProperty("/MassRequest/attributeList", responseData.attributeList);
                            that.closeBusyDialog();
                        },
                        function (error) {
                            that.closeBusyDialog();
                        }
                    );
                }
            },

            fnGetOdataService: function (oSrvModelName, url, sFilter, sExpandEntityName) {
                var that = this;
                that.openBusyDialog();

                return new Promise((resolve, reject) => {
                    var oSrvModel = this.getOwnerComponent().getModel(oSrvModelName);

                    oSrvModel.read(url, {
                        urlParameters: {
                            "$format": "json",
                            "$filter": sFilter,
                            "$expand": sExpandEntityName
                        },
                        success: function (resData) {
                            that.closeBusyDialog();
                            resolve(resData);
                        },
                        error: function (oError) {
                            that.closeBusyDialog();
                            console.error("oData Service call failed:", oError);
                            reject(oError);
                        }
                    });
                });
            },

            onfnToLoadSystemDetailsOdataLookup: function (systemId) {
                return new Promise((resolve, reject) => {
                    let lookupModel = this.getModelDetails("LookupModel"),
                        lookUpsToLoad = lookupModel.getProperty("/basicDataList"),
                        oDataLookupsPath = "/oDataLookups/" + systemId,
                        dropdownModelName = lookupModel.getProperty(`/oDataTargetSystemIdToModel/${systemId}`),
                        dropdownModel = this.getModelDetails(dropdownModelName);

                    lookupModel.setProperty(oDataLookupsPath, {});
                    dropdownModel?.setUseBatch(true);

                    let promises = lookUpsToLoad.map((lookup) => {
                        return new Promise((resolveInner, rejectInner) => {
                            let urlName = lookup.url,
                                url = `/${urlName}?$format=json`,
                                urlParameters = {
                                    $format: "json",
                                },
                                lookUpsToLoadEntity = lookup.bindingPath,
                                bindingPath = oDataLookupsPath + "/" + lookUpsToLoadEntity;

                            dropdownModel?.read(url, {
                                urlParameters: urlParameters,
                                success: function (oData, responseData) {
                                    if (lookUpsToLoadEntity === "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE") {
                                        (oData?.results || []).map((item) => {
                                            if (item.Description && item.MaterialStatus === "") {
                                                item.MaterialStatus = "BLANK";
                                            }
                                        });
                                    }
                                    lookupModel.setProperty(bindingPath, oData.results);
                                    resolveInner();
                                },
                                error: function () {
                                    rejectInner();
                                },
                            });
                        });
                    });

                    Promise.all(promises)
                        .then(() => {
                            dropdownModel?.setUseBatch(false);
                            dropdownModel?.submitChanges({
                                success: function () {
                                    resolve();
                                },
                                error: function () {
                                    reject();
                                },
                            });
                            this.handleSystemDetailsOdataLookup(systemId);
                        })
                        .catch(reject);
                });
            },

            // function to handle binding related to corresponding view
            handleSystemDetailsOdataLookup: function (selectedSystem) {
                var lookupModel = this.getModelDetails("LookupModel"),
                    selectedODataLookupPath = "/oDataLookups/" + selectedSystem,
                    selectedODataLookupData = lookupModel.getProperty(selectedODataLookupPath);
                lookupModel.setProperty("/selectedSystemDataDropdown", selectedODataLookupData);
            },

            // To check which function to be called, whether odata batch call to be executed or not
            // fnToRenderOdataLookup: function (selectedSystem) {
            //     let lookupModel = this.getModelDetails("LookupModel"),
            //         oDataLookupsPath = "/oDataLookups/" + selectedSystem,
            //         selectedSystemLookups = lookupModel.getProperty(oDataLookupsPath);
            //     if (selectedSystemLookups) {
            //         this.handleSystemDetailsOdataLookup(selectedSystem);
            //     } else {
            //         this.onfnToLoadSystemDetailsOdataLookup(selectedSystem);
            //     }
            // },

            fnToRenderOdataLookup: function (selectedSystem) {
                return new Promise((resolve, reject) => {
                    let lookupModel = this.getModelDetails("LookupModel"),
                        oDataLookupsPath = "/oDataLookups/" + selectedSystem,
                        selectedSystemLookups = lookupModel.getProperty(oDataLookupsPath);

                    if (selectedSystemLookups) {
                        this.handleSystemDetailsOdataLookup(selectedSystem);
                        resolve();
                    } else {
                        this.onfnToLoadSystemDetailsOdataLookup(selectedSystem)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            },

            // BaseUnitOfMeasure Lookup integration of basic data 1 (system details rule call)

            fnToRenderRulesLookup: function (materialType, selectedSystem) {
                return new Promise((resolve, reject) => {
                    let lookupModel = this.getModelDetails("LookupModel"),
                        rulesLookupsPath = "/rulesLookups/" + materialType + "/" + selectedSystem,
                        selectedSystemLookups = lookupModel.getProperty(rulesLookupsPath);
                    if (!lookupModel.getProperty(`/rulesLookups/${materialType}`)) {
                        lookupModel.setProperty(`/rulesLookups/${materialType}`, {});
                    }
                    if (selectedSystemLookups) {
                        this.handleSystemDetailsRulesLookup(materialType, selectedSystem);
                        resolve();
                    } else {
                        this.onfnToLoadSystemDetailsRulesLookup(materialType, selectedSystem)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            },

            handleSystemDetailsRulesLookup: function (materialType, selectedSystem) {
                var lookupModel = this.getModelDetails("LookupModel"),
                    selectedRulesLookupPath = "/rulesLookups/" + materialType + "/" + selectedSystem,
                    selectedRulesLookupData = lookupModel.getProperty(selectedRulesLookupPath);
                lookupModel.setProperty("/selectedRulesSystemDataDropdown", selectedRulesLookupData);
            },

            onfnToLoadSystemDetailsRulesLookup: function (materialType, selectedSystem) {
                return new Promise((resolve, reject) => {
                    var lookupModel = this.getModelDetails("LookupModel"),
                        rulesLookupsPath = "/rulesLookups/" + materialType + "/" + selectedSystem,
                        that = this,
                        rulesLookupBindingPath,
                        systemDetailsRulesList = lookupModel.getProperty("/systemDetailsRulesList");
                    lookupModel.setProperty(`/rulesLookups/${materialType}/${selectedSystem}`, {});

                    systemDetailsRulesList.map(item => {
                        var conditions = [{
                            "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": "*"
                        }],
                            MM_LOOKUP_RULE_NAME = item?.decisionTableName,
                            payload,
                            systemFilters = [
                                {
                                    "column": `${item.decisionTableName}.MM_MATERIAL_TYPE`,
                                    "operator": "equal",
                                    "value": materialType
                                },
                                {
                                    "column": `${item.decisionTableName}.MM_TARGET_SYSTEM_ID`,
                                    "operator": "equal",
                                    "value": selectedSystem
                                }
                            ];
                        payload = that.onGetRulePayload(item.decisionTableName, conditions, null, systemFilters);
                        rulesLookupBindingPath = rulesLookupsPath + "/" + item?.bindingPath;
                        that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                            function (responseData) {
                                let data = that.fnToMapBasicDataBaseUomValues((responseData?.data?.result[0])[MM_LOOKUP_RULE_NAME]);
                                lookupModel.setProperty(rulesLookupBindingPath, data);
                                that.handleSystemDetailsRulesLookup(materialType, selectedSystem);
                                resolve()
                            },
                            function (error) {
                                reject();
                            },
                        );
                    })
                })
            },

            fnToMapBasicDataBaseUomValues: function (data) {
                var lookupModel = this.getModelDetails("LookupModel"),
                    listOfBaseUoms = lookupModel.getProperty("/MM_UOM_REF_LIST"),
                    mappedBaseUom;
                mappedBaseUom = data?.map(itemA =>
                    listOfBaseUoms?.find(itemB => parseInt(itemB.MM_KEY) === parseInt(itemA.MM_BASE_UOM_ID))
                );
                mappedBaseUom = mappedBaseUom?.map(item => ({
                    MeasUnitText: item?.MM_UOM_REF_LIST_DESC,
                    IntMeasUnit: item?.MM_UOM_REF_LIST_CODE,
                    MM_KEY: item?.MM_KEY,
                    MM_ACTIVE: item?.MM_ACTIVE
                }));
                return mappedBaseUom || [];
            },

            // rule lookup end
            fnToLoadSystemDetails: async function (currentSystemId, repositorySystemStatusId = null) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    isSavedCurrentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${currentSystemId}`),
                    savedCurrentSystemDetails = isSavedCurrentSystemDetails ? JSON.parse(JSON.stringify(isSavedCurrentSystemDetails)) : isSavedCurrentSystemDetails,
                    updatedSystemDetails = null,
                    isToSetBasicDataDefaultValue = MaterialDetails.getProperty(`/GeneralData/setBasicDataDefaultValue/${currentSystemId}`),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    defaultValueIncluded = false,
                    systemDataList = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    isToCopyProductDataFields = systemDataList.some(systems => { if (systems.MM_SYSTEM_ID == currentSystemId && systems.requestSystemStatusId == 1) return systems });
                // isToSetBasicDataDefaultValue - will be true if only the data is read from repo and it's status is Commit to Repo
                defaultValueIncluded = isToSetBasicDataDefaultValue || defaultValueIncluded;
                currentSystemId = typeof (currentSystemId) == 'string' ? parseInt(currentSystemId) : currentSystemId;
                if (currentView == "Repository") {
                    let Repository = this.getModelDetails("Repository"),
                        repoEditIsFor = Repository.getProperty("/MaterialSelected/repoSubmitFor");
                    requestType = (repoEditIsFor == "Extend") ? 2 : ((repoEditIsFor == "Modify") ? 3 : null);
                    if (repoEditIsFor == "Extend") {
                        isToCopyProductDataFields = systemDataList.some(systems => { if (systems.MM_SYSTEM_ID == currentSystemId && (systems.repositorySystemStatusId == 10 || systems.repositorySystemStatusId == 11 || systems.repositorySystemStatusId == null)) return systems });
                    }
                }
                MaterialDetails.setProperty(`/SystemDetails/basicData1/generalData/data/MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE`, null);
                if (savedCurrentSystemDetails && !defaultValueIncluded) {
                    //Add Editability,Default & mandatory 
                    await this.handleBasicDataProperties(currentSystemId, repositorySystemStatusId, defaultValueIncluded);
                    savedCurrentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${currentSystemId}`);
                    updatedSystemDetails = savedCurrentSystemDetails;
                }
                else {
                    defaultValueIncluded = true;
                    //Add Editability,Default & mandatory 
                    await this.handleBasicDataProperties(currentSystemId, repositorySystemStatusId, defaultValueIncluded);
                    savedCurrentSystemDetails = MaterialDetails.getProperty(`/AggregatedSystemDetails/${currentSystemId}`);
                    updatedSystemDetails = savedCurrentSystemDetails;
                    if (isToSetBasicDataDefaultValue) {
                        MaterialDetails.setProperty(`/GeneralData/setBasicDataDefaultValue/${currentSystemId}`, false);
                    }
                }

                if (updatedSystemDetails) {
                    let sGlobalLongDesc = this.onGetProductDataValue("1017")?.sValue,
                        sGlobalDesc = this.onGetProductDataValue("1016")?.sValue,
                        sBaseUOMofPD = this.onGetProductDataValue("1009")?.sValue,
                        sLifecycle = this.onGetProductDataValue("1025")?.sValue,
                        descriptionDataList = updatedSystemDetails?.AdditionalData?.descriptionData?.data || [],
                        isGlobalDescPresent = false,
                        basicDataTextList = updatedSystemDetails?.AdditionalData?.basicDataText?.data || [],
                        isGlobalLongDescPresent = false;

                    // To Update Addiitonal Data - Description ( Z1 )
                    if (requestType == 1 || requestType == 3 || ((requestType == 2 || requestType == 6) && isToCopyProductDataFields)) {
                        if (descriptionDataList.length > 0) {
                            for (let item in descriptionDataList) {
                                if (descriptionDataList[item].MM_LANGUAGE === "Z1") {
                                    descriptionDataList[item].MM_MATERIAL_DESCRIPTION_MAKT_MAKTX = sGlobalDesc;
                                    isGlobalDescPresent = true;
                                    break;
                                }
                            }
                        }
                        if (!isGlobalDescPresent && sGlobalDesc) {
                            let newItem = {
                                "MM_LANGUAGE": "Z1",
                                "MM_MATERIAL_DESCRIPTION_MAKT_MAKTX": sGlobalDesc
                            }
                            descriptionDataList.push(newItem);
                        }

                        // To Update Addiitonal Data - Basic Data Text ( Z1 )
                        if (basicDataTextList.length > 0) {
                            for (let item in basicDataTextList) {
                                if (basicDataTextList[item].MM_LANGUAGE === "Z1") {
                                    basicDataTextList[item].MM_MATERIAL_LONG_DESC_STXH_TDNAME = sGlobalLongDesc;
                                    isGlobalLongDescPresent = true;
                                    break;
                                }
                            }
                        }
                        if (!isGlobalLongDescPresent && sGlobalLongDesc) {
                            let newItem = {
                                "MM_LANGUAGE": "Z1",
                                "MM_MATERIAL_LONG_DESC_STXH_TDNAME": sGlobalLongDesc
                            }
                            basicDataTextList.push(newItem);
                        }
                    }

                    if (defaultValueIncluded) {
                        // To Update Base UOM of Basic Data 
                        if ((requestType == 1 || ((requestType == 2 || requestType == 6) && isToCopyProductDataFields)) && sBaseUOMofPD) {
                            try {
                                updatedSystemDetails.basicData1.generalData.data.MM_BASE_UNIT_OF_MEASURE_MARM_MEINS = sBaseUOMofPD;
                            }
                            catch (e) { }
                        }

                        // To update the X-Plant Status based on Lifecycle Status
                        if ((requestType == 1 || requestType == 3 || ((requestType == 2 || requestType == 6) && isToCopyProductDataFields)) && sLifecycle) {
                            let lifeCycleMapping = LookupModel.getProperty("/MM_MATERIAL_LIFE_CYCLE_STATUS_MAPPING_RULE"),
                                mappedObj = {},
                                MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = null;
                            try {
                                mappedObj = lifeCycleMapping?.find(function (mapRule) {
                                    let applicableSystemIDs = mapRule.MM_SYSTEM;
                                    if (applicableSystemIDs?.includes(currentSystemId) && mapRule?.MM_MATERIAL_LIFE_CYCLE_STATUS_MAPPING_RULE_CODE == sLifecycle) {
                                        return mapRule;
                                    }
                                })
                                MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = mappedObj?.MM_X_PLANT_MATERIAL_STATUS;
                                // if (currentSystemId == "2" && sLifecycle == "2") {
                                //     updatedSystemDetails.basicData1.generalData.data.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = null;
                                // } else {
                                //     updatedSystemDetails.basicData1.generalData.data.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE;
                                // }
                                updatedSystemDetails.basicData1.generalData.data.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE;

                            } catch (e) { }
                        }
                    }
                }
                MaterialDetails.setProperty("/SystemDetails", JSON?.parse(JSON?.stringify(updatedSystemDetails)));
            },

            // Additional Uom

            fnProcessAltUomData: function (oData) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    oDataSystemToId = LookupModel.getProperty("/oDataTargetSystemToId"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    currentSystemId,
                    aAltUomData;
                if (currentView == "CreateProject" && requestType == "1") {
                    // Don't copy data
                    return;
                }
                oData.forEach(function (item) {
                    currentSystemId = oDataSystemToId[item?.SAP__Origin];
                    aAltUomData = item?.ToUnitOfMeasure?.results;
                    let UOMList = [];
                    aAltUomData?.map(UOMRefObj => {
                        let uomObj = {};
                        uomObj = {
                            "MM_DENOMINATOR_MARM_UMREN": UOMRefObj?.Denominatr || null,
                            "MM_ALTERNATE_UNIT_MARM_MEINH": UOMRefObj?.AltUnit || null,
                            "MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT": null,
                            "MM_MEASUREMENT_UNIT_TEXT_BUN_MARM_MSEHT": null,
                            "MM_NUMERATOR_MARM_UMREZ": UOMRefObj?.Numerator || null,
                            "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS": UOMRefObj?.BaseUom || null,
                            "MM_EAN_UPC_MARM_EAN11": UOMRefObj?.EanUpc || null,
                            "MM_EAN_VARIANT_MARM_GTIN_VARIANT": UOMRefObj?.GtinVariant || null,
                            "MM_CN_MARM_NUMTP": UOMRefObj?.EanCat || null,
                            "MM_AU_MARM_PRFZ": false,
                            "MM_A_MARM_ZEANS": false,
                            "MM_LENGTH_MARM_LAENG": UOMRefObj?.Length || null,
                            "MM_WIDTH_MARM_BREIT": UOMRefObj?.Width || null,
                            "MM_HEIGHT_MARM_HOEHE": UOMRefObj?.Height || null,
                            "MM_VOLUME_MARM_VOLUM": UOMRefObj?.Volume || null,
                            "MM_VOLUME_UNIT_MARM_VOLEH": UOMRefObj?.Volumeunit || null,
                            "MM_GROSS_WEIGHT_MARM_BRGEW": UOMRefObj?.GrossWt || null,
                            "MM_NET_WEIGHT_MARM_NTGEW": UOMRefObj?.NetWeight || null,
                            "newlyAdded": false,
                            "MM_NUMBER_MARM_AZSUB": null,
                            "MM_LUN_MARM_MESUB": UOMRefObj?.SubUom || null,
                            "MM_GTIN_MARM_STTPEC_GTIN": UOMRefObj?.GS1GTIN || null,
                            "MM_SER_NUM_MANAG_TYPE_MARM_STTPEC_SERNO_MANAGED": UOMRefObj?.SerNoMngType || null,
                            "MM_BP_TO_PROVIDE_SER_NUMB_MARM_STTPEC_SERNO_PROV_BUP": UOMRefObj?.BPtoProvideSerNo || null,
                            "MM_NATIONAL_CODE_MARM_STTPEC_NCODE": UOMRefObj?.NatCode || null,
                            "MM_N_CODE_T_MARM_STTPEC_NCODE_TY": UOMRefObj?.NationalCodeType || null,
                            "MM_REGISTRATION_CODE_MARM_STTPEC_RCODE": UOMRefObj?.RegCode || null,
                            "MM_UOM_SYNC_ACTIVE_FLAG_MARM_STTPEC_UOM_SYNC": UOMRefObj?.UoMSyncActive || false,
                            "MM_WEIGHT_UNIT_MARM_GEWEI": UOMRefObj?.UnitOfWt || null,
                            "MM_UNIT_OF_DIMENSION_MARM_MEABM": UOMRefObj?.UnitDim || null,
                            "MM_SERIALIZATION_INDICATOR_MARM_STTPEC_SERUSE": UOMRefObj?.SerializationUsage || false,
                            "isDeleted": false
                        }
                        UOMList.push(uomObj);
                    });
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/AdditionalUOM/UOMData`, UOMList);
                    MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalUomDto`, JSON.parse(JSON.stringify(UOMList)));
                });
            },

            oneditAltUom: function (oEvent) {
                let oView = this.getView(),
                    materialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    baseUomLookupList = LookupModel.getProperty("/selectedSystemDataDropdown/MM_BASE_UNIT_OF_MEASURE_MARM_MEINS"),
                    selectedPath = oEvent && oEvent?.getSource()?.getParent()?.getParent()?.getBindingContext("MaterialDetails")?.sPath,
                    selectedRowData = materialDetails.getProperty(selectedPath);
                materialDetails.setProperty("/SystemDetails/AdditionalUOM/altUomListItem/editSelectedPath", selectedPath);
                materialDetails.setProperty("/SystemDetails/AdditionalUOM/altUomListItem/editUomBtnClicked", true);
                materialDetails.setProperty("/SystemDetails/AdditionalUOM/altUomListItem/addBtnClicked", false);
                materialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/data", selectedRowData);
                materialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/valueState", {});

                if (selectedRowData && selectedRowData?.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS == selectedRowData?.MM_ALTERNATE_UNIT_MARM_MEINH) {
                    materialDetails.setProperty("/SystemDetails/AdditionalUOM/filteredAltUomDropdown", baseUomLookupList);
                } else {
                    let updatedAltUomList = baseUomLookupList.filter(item => item?.IntMeasUnit != selectedRowData?.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS);
                    materialDetails.setProperty("/SystemDetails/AdditionalUOM/filteredAltUomDropdown", updatedAltUomList);
                }

                this.LoadFragment("AddNewUOM", oView, true);
            },

            fnUpdateAltUomDataMaterialAdd: function (systemId) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    altUomDefaultFieldVals = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/AdditionalUOM/altUomDefaultFieldVals`),
                    selectedBaseUKey = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/generalData/data/MM_BASE_UNIT_OF_MEASURE_MARM_MEINS`),
                    prevSelValue = MaterialDetails.getProperty(`/SystemData/BasicData1BaseUom/${systemId}/prevSelectedVal`),
                    ean = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/dimensionsEans/data/MM_EAN_UPC_MARA_EAN11`),
                    eanCat = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/dimensionsEans/data/MM_EAN_CATEGORY_MARA_NUMTP`),
                    grossWt = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/dimensionsEans/data/MM_GROSS_WEIGHT_MARA_BRGEW`),
                    netWt = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/dimensionsEans/data/MM_NET_WEIGHT_MARA_NTGEW`),
                    volume = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/dimensionsEans/data/MM_VOLUME_MARM_VOLUM`),
                    volumeUnit = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/dimensionsEans/data/MM_VOLUME_UNIT_MARM_VOLEH`),
                    weightUnit = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/basicData1/dimensionsEans/data/MM_WEIGHT_UNIT_MARM_GEWEI`),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    addUOMList = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/AdditionalUOM/UOMData`) || [],
                    CreateProject = this.getModelDetails("CreateProject"),
                    lookupModel = this.getModelDetails("LookupModel"),
                    listOfBaseUoms = lookupModel.getProperty("/MM_UOM_REF_LIST"),
                    materialListId = currentView == "CreateProject" ? CreateProject.getProperty("/MaterialList/selectedMaterialData/materialListId") : null,
                    baseUomMappedObj = listOfBaseUoms?.find(item => {
                        if (item?.MM_KEY == selectedBaseUKey) {
                            return item;
                        }
                    }),
                    baseUomVal = baseUomMappedObj?.MM_UOM_REF_LIST_CODE,
                    isBaseUomValExist = false,
                    that = this,
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
                    newAltUomRow;
                MaterialDetails.setProperty(`/SystemData/BasicData1BaseUom/${systemId}`, {});
                if (!addUOMList?.length && baseUomVal) {
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
                    }];
                    objToUpdate = [{
                        ...objToUpdate[0],
                        ...altUomDefault
                    }];
                    newAltUomRow = this.fnFrameAltUomPayload(objToUpdate, materialListId);
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemId}/AdditionalUOM/UOMData`, newAltUomRow);
                } else if (addUOMList?.length && baseUomVal) {
                    addUOMList.map((item) => {
                        item.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS = baseUomVal;
                    })
                    let aOldAdditonalData = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${systemId}/additionalUomDto`);

                    addUOMList.map((item) => {
                        if (item.MM_ALTERNATE_UNIT_MARM_MEINH == baseUomVal) {
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
                    if (!isBaseUomValExist && baseUomVal) {
                        let delAltUnitList = [];
                        aOldAdditonalData?.map(item => {
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
                        if (delAltUnitList?.length) {
                            that.fnDeleteAltUomRow(delAltUnitList, materialListId, systemId);
                        }
                        addUOMList = [];
                        objToUpdate = [{
                            ...objToUpdate[0],
                            ...altUomDefault
                        }];
                        newAltUomRow = this.fnFrameAltUomPayload(objToUpdate, materialListId);
                        addUOMList.unshift(newAltUomRow[0]);
                    }
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${systemId}/AdditionalUOM/UOMData`, addUOMList);
                }
                MaterialDetails.setProperty(`/SystemData/BasicData1BaseUom/${systemId}/prevSelectedVal`, baseUomVal);
            },

            onAddAdditionalUOM: function () {
                let oView = this.getView(),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    baseUomLookupList = LookupModel.getProperty("/selectedSystemDataDropdown/MM_BASE_UNIT_OF_MEASURE_MARM_MEINS"),
                    basicData1BaseUomVal = MaterialDetails.getProperty("/SystemDetails/basicData1/generalData/data/MM_BASE_UNIT_OF_MEASURE_MARM_MEINS"),
                    lookupModel = this.getModelDetails("LookupModel"),
                    listOfBaseUoms = lookupModel.getProperty("/MM_UOM_REF_LIST"),
                    baseUomMappedObj = listOfBaseUoms?.find(item => {
                        if (item?.MM_KEY == basicData1BaseUomVal) {
                            return item;
                        }
                    }),
                    baseUomVal = baseUomMappedObj?.MM_UOM_REF_LIST_CODE;
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/altUomListItem/editUomBtnClicked", false);
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/altUomListItem/addBtnClicked", true);
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/data", {});
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/data/MM_BASE_UNIT_OF_MEASURE_MARA_MEINS", baseUomVal);
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/valueState", {});

                // Alt Uom Default Values Set
                let altUomDefaultFieldVals = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/altUomDefaultFieldVals"),
                    altUomDefault = {
                        "MM_DENOMINATOR_MARM_UMREN": altUomDefaultFieldVals?.MM_DENOMINATOR_MARM_UMREN?.MM_DEFAULT_VALUE || null,
                        "MM_ALTERNATE_UNIT_MARM_MEINH": altUomDefaultFieldVals?.MM_ALTERNATE_UNIT_MARM_MEINH?.MM_DEFAULT_VALUE || null,
                        "MM_ALT_UNIT_ISO_MARM_LREMEI_ISO": altUomDefaultFieldVals?.MM_ALT_UNIT_ISO_MARM_LREMEI_ISO?.MM_DEFAULT_VALUE || null,
                        "MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT": altUomDefaultFieldVals?.MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT?.MM_DEFAULT_VALUE || null,
                        "MM_NUMERATOR_MARM_UMREZ": altUomDefaultFieldVals?.MM_NUMERATOR_MARM_UMREZ?.MM_DEFAULT_VALUE || null,
                        "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS": (baseUomVal ? baseUomVal : altUomDefaultFieldVals?.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS?.MM_DEFAULT_VALUE) || null,
                        "MM_MEASUREMENT_UNIT_TEXT_BUN_MARM_MSEHT": altUomDefaultFieldVals?.MM_MEASUREMENT_UNIT_TEXT_BUN_MARM_MSEHT?.MM_DEFAULT_VALUE || null,
                        "MM_EAN_UPC_MARM_EAN11": altUomDefaultFieldVals?.MM_EAN_UPC_MARM_EAN11?.MM_DEFAULT_VALUE || null,
                        "MM_EAN_VARIANT_MARM_GTIN_VARIANT": altUomDefaultFieldVals?.MM_EAN_VARIANT_MARM_GTIN_VARIANT?.MM_DEFAULT_VALUE || null,
                        "MM_CN_MARM_NUMTP": altUomDefaultFieldVals?.MM_CN_MARM_NUMTP?.MM_DEFAULT_VALUE || null,
                        "MM_AU_MARM_PRFZ": altUomDefaultFieldVals?.MM_AU_MARM_PRFZ?.MM_DEFAULT_VALUE || null,
                        "MM_A_MARM_ZEANS": altUomDefaultFieldVals?.MM_A_MARM_ZEANS?.MM_DEFAULT_VALUE || null,
                        "MM_LENGTH_MARM_LAENG": altUomDefaultFieldVals?.MM_LENGTH_MARM_LAENG?.MM_DEFAULT_VALUE || null,
                        "MM_WIDTH_MARM_BREIT": altUomDefaultFieldVals?.MM_WIDTH_MARM_BREIT?.MM_DEFAULT_VALUE || null,
                        "MM_HEIGHT_MARM_HOEHE": altUomDefaultFieldVals?.MM_HEIGHT_MARM_HOEHE?.MM_DEFAULT_VALUE || null,
                        "MM_UNIT_OF_DIMENSION_MARM_MEABM": altUomDefaultFieldVals?.MM_UNIT_OF_DIMENSION_MARM_MEABM?.MM_DEFAULT_VALUE || null,
                        "MM_VOLUME_MARM_VOLUM": altUomDefaultFieldVals?.MM_VOLUME_MARM_VOLUM?.MM_DEFAULT_VALUE || null,
                        "MM_VOLUME_UNIT_MARM_VOLEH": altUomDefaultFieldVals?.MM_VOLUME_UNIT_MARM_VOLEH?.MM_DEFAULT_VALUE || null,
                        "MM_GROSS_WEIGHT_MARM_BRGEW": altUomDefaultFieldVals?.MM_GROSS_WEIGHT_MARM_BRGEW?.MM_DEFAULT_VALUE || null,
                        "MM_NET_WEIGHT_MARM_NTGEW": altUomDefaultFieldVals?.MM_NET_WEIGHT_MARM_NTGEW?.MM_DEFAULT_VALUE || null,
                        "MM_WEIGHT_UNIT_MARM_GEWEI": altUomDefaultFieldVals?.MM_WEIGHT_UNIT_MARM_GEWEI?.MM_DEFAULT_VALUE || null,
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
                    };
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/data", structuredClone(altUomDefault));
                //End

                let updatedAltUomList = baseUomLookupList?.filter(item => item?.IntMeasUnit != baseUomVal);
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/filteredAltUomDropdown", updatedAltUomList);

                this.LoadFragment("AddNewUOM", oView, true);
            },

            onChangeAltUnit: function (oEvent) {
                let selectedAltUnitAddText = oEvent?.getSource()?.getSelectedItem()?.getAdditionalText(),
                    LookupModel = this.getModelDetails("LookupModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    MM_BASE_UNIT_OF_MEASURE_MARM_MEINS = LookupModel.getProperty("/selectedSystemDataDropdown/MM_BASE_UNIT_OF_MEASURE_MARM_MEINS"),
                    MM_ALT_UNIT_ISO_MARM_LREMEI_ISO = "";
                MM_ALT_UNIT_ISO_MARM_LREMEI_ISO = MM_BASE_UNIT_OF_MEASURE_MARM_MEINS?.find(item => {
                    return item?.MeasUnitText == selectedAltUnitAddText;
                });
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/data/MM_ALT_UNIT_ISO_MARM_LREMEI_ISO", MM_ALT_UNIT_ISO_MARM_LREMEI_ISO?.ISOCode);
                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/newUOMData/data/MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT", selectedAltUnitAddText);
            },

            fnCloseAddNewUOMPopUp: function () {
                this.getView().byId("id_AddNewUOM").close();
            },

            fnAltUomMandCheck: function () {
                let isMand = true,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    s_WF_Requestor = "Request_Form_Submission",
                    s_WF_Rework = "Requester_Rework_WF_Task",
                    s_WF_GMDM = "GMDM_WF_Task",
                    mandFieldList = [];

                if (currentView == "CreateProject" && (wfTaskType == s_WF_Requestor || wfTaskType == s_WF_Rework)) {
                    mandFieldList = [
                        {
                            "fieldPath": "MM_ALTERNATE_UNIT_MARM_MEINH",
                            "i18Text": "MM_ALTERNATE_UNIT_MARM_MEINH"
                        },
                        {
                            "fieldPath": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS",
                            "i18Text": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS"
                        }
                    ]
                } else if ((currentView == "CreateProject" && wfTaskType == s_WF_GMDM) || currentView == "Repository") {
                    mandFieldList = [
                        {
                            "fieldPath": "MM_ALTERNATE_UNIT_MARM_MEINH",
                            "i18Text": "MM_ALTERNATE_UNIT_MARM_MEINH"
                        },
                        {
                            "fieldPath": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS",
                            "i18Text": "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS"
                        },
                        {
                            "fieldPath": "MM_WEIGHT_UNIT_MARM_GEWEI",
                            "i18Text": "MM_WEIGHT_UNIT_MARM_GEWEI"
                        }
                    ]
                }

                mandFieldList.map(item => {
                    let fieldData = MaterialDetails.getProperty(`/SystemDetails/AdditionalUOM/newUOMData/data/${item.fieldPath}`);
                    if (!fieldData) {
                        isMand = false;
                        MaterialDetails.setProperty(`/SystemDetails/AdditionalUOM/newUOMData/valueState/${item.fieldPath}`, "Error");
                    }
                })
                return isMand;
            },

            fnAddNewUOMData: function () {
                if (!this.fnAltUomMandCheck()) {
                    let errorMessageMandatory = this.geti18nText("errorMessageMandatory");
                    MessageToast.show(errorMessageMandatory);
                    return;
                }

                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    addUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData") || [],
                    newUOMData = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/newUOMData/data");
                
                newUOMData.newlyAdded = true;
                newUOMData.isDeleted = false;

                addUOMList.push(newUOMData);

                MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/UOMData", addUOMList);
                this.getView().byId("id_AddNewUOM").close(); addUOMList
            },

            fnChangeExistingUOMData: function () {
                if (!this.fnAltUomMandCheck()) {
                    let errorMessageMandatory = this.geti18nText("errorMessageMandatory");
                    MessageToast.show(errorMessageMandatory);
                    return;
                }

                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    newUOMData = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/newUOMData/data"),
                    editSelectedPath = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/altUomListItem/editSelectedPath");
                newUOMData.isModified = true;
                newUOMData.isDeleted = false;
                MaterialDetails.setProperty(editSelectedPath, newUOMData);
                this.getView().byId("id_AddNewUOM").close();
            },

            onDeleteAltUom: async function (oEvent) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    sPath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    selectedPath = oEvent && oEvent?.getSource()?.getParent()?.getParent()?.getBindingContext("MaterialDetails")?.sPath,
                    altUOMList = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData"),
                    rowIndex = selectedPath?.substring(selectedPath?.lastIndexOf('/') + 1),
                    that = this,
                    isNewlyAdded = MaterialDetails.getProperty(sPath)?.newlyAdded,  //Records which are new for this material
                    deleteConfirmationExisting = this.geti18nText("deleteConfirmationExisting"),
                    deleteConfirmation = this.geti18nText("deleteConfirmation"),
                    requestTypeId = this.fnGetRequestHeaderData("requestType");

                if((currentView === "CreateProject" && requestTypeId == 3 && !isNewlyAdded) || (currentView === "Repository" && !isNewlyAdded)){
                    await this.showMessage(deleteConfirmationExisting, "Q", ["YES", "NO"], "YES", async function (action) {
                    if (action === "YES") {
                        let MaterialDetails = that.getModelDetails("MaterialDetails"),
                            selectedAltUnit = MaterialDetails.getProperty(selectedPath)?.MM_ALTERNATE_UNIT_MARM_MEINH,
                            currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                            aOldAdditonalData = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalUomDto`),
                            // materialListId = that.fnGetMaterialDetailsSelectedData("materialListId"),
                            isNewlyAddedRow = true;
                            // deleteAltUomList = [];

                        aOldAdditonalData?.map(item => {
                            if (item.MM_ALTERNATE_UNIT_MARM_MEINH == selectedAltUnit) {
                                isNewlyAddedRow = false;
                            }
                        })

                        altUOMList?.map(item => {
                                if (item.MM_ALTERNATE_UNIT_MARM_MEINH == selectedAltUnit) {
                                    item.isDeleted = true;
                                    // MaterialDetails.refresh(true);
                                }
                            })
                        }
                });
                }
                else{
                    await this.showMessage(deleteConfirmation, "Q", ["YES", "NO"], "YES", async function (action) {
                    if (action === "YES") {
                        let MaterialDetails = that.getModelDetails("MaterialDetails"),
                            selectedAltUnit = MaterialDetails.getProperty(selectedPath)?.MM_ALTERNATE_UNIT_MARM_MEINH,
                            currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                            aOldAdditonalData = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/additionalUomDto`),
                            materialListId = that.fnGetMaterialDetailsSelectedData("materialListId"),
                            isNewlyAddedRow = true,
                            deleteAltUomList = [];

                        aOldAdditonalData?.map(item => {
                            if (item.MM_ALTERNATE_UNIT_MARM_MEINH == selectedAltUnit) {
                                isNewlyAddedRow = false;
                            }
                        })
                        if (!isNewlyAddedRow && materialListId) {
                            deleteAltUomList.push(selectedAltUnit);
                            await that.fnDeleteAltUomRow(deleteAltUomList, materialListId, currentSystemId);
                            let aggregatedSystemDetailsData = MaterialDetails.getProperty(`/AggregatedSystemDetails/${currentSystemId}/AdditionalUOM/UOMData`)
                            MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/UOMData", aggregatedSystemDetailsData);
                        } else {
                            altUOMList.splice(rowIndex, 1);
                            MaterialDetails.setProperty("/SystemDetails/AdditionalUOM/UOMData", altUOMList);
                        }
                    }
                });
                }
            },

            fnDeleteAltUomRow: async function (deleteAltUomList, materialListId, currentSystemId) {
                return new Promise((resolve, reject) => {
                    let payload = {
                        "altUnit": deleteAltUomList,
                        "materialListId": materialListId,
                        "systemId": currentSystemId
                    },
                        oAppModel = this.getModelDetails("oAppModel"),
                        MaterialDetails = this.getModelDetails("MaterialDetails"),
                        viewName = oAppModel.getProperty("/sideNavigation/currentView"),
                        altUomData = MaterialDetails.getProperty("/SystemDetails/AdditionalUOM/UOMData"),
                        that = this;
                    this.fnProcessDataRequest("MM_JAVA/deleteAltUom", "DELETE", null, true, payload,
                        async function (responseData) {
                            await that.getDatabyMaterialListId(materialListId);
                            that.onGetFilteredDataMatChangeLog(viewName, true);
                            resolve()
                            that.closeBusyDialog();
                        },
                        function (error) {
                            reject()
                            that.closeBusyDialog();
                        }
                    );
                })
            },

            /**Additional Data - Uom Dialog(Cancel press event).            
            */
            pressAddUomDialogCancel: function () {
                this.getView().byId("id_AddNewUOM").close();
            },

            fnFrameAltUomPayload: function (altUOMsData, materialListId) {
                let altUomPayload = [];

                altUOMsData?.map(item => {
                    let altUomRowData = {
                        "MM_A_MARM_ZEANS": item?.MM_A_MARM_ZEANS || false,
                        // "additionalUom": "G",
                        "MM_ALTERNATE_UNIT_MARM_MEINH": item?.MM_ALTERNATE_UNIT_MARM_MEINH || null,
                        "MM_ALT_UNIT_ISO_MARM_LREMEI_ISO": item?.MM_ALT_UNIT_ISO_MARM_LREMEI_ISO || null,
                        "MM_AU_MARM_PRFZ": item?.MM_AU_MARM_PRFZ || false,
                        "MM_BASE_UNIT_OF_MEASURE_MARA_MEINS": item?.MM_BASE_UNIT_OF_MEASURE_MARA_MEINS || null,
                        "MM_BP_TO_PROVIDE_SER_NUMB_MARM_STTPEC_SERNO_PROV_BUP": item?.MM_BP_TO_PROVIDE_SER_NUMB_MARM_STTPEC_SERNO_PROV_BUP || null,
                        "MM_DENOMINATOR_MARM_UMREN": item?.MM_DENOMINATOR_MARM_UMREN || "0.000",
                        "MM_CN_MARM_NUMTP": item?.MM_CN_MARM_NUMTP || null,
                        "MM_EAN_UPC_MARM_EAN11": item?.MM_EAN_UPC_MARM_EAN11 || null,
                        "MM_GROSS_WEIGHT_MARM_BRGEW": item?.MM_GROSS_WEIGHT_MARM_BRGEW || "0.000",
                        "MM_GTIN_MARM_STTPEC_GTIN": item?.MM_GTIN_MARM_STTPEC_GTIN || null,
                        "MM_EAN_VARIANT_MARM_GTIN_VARIANT": item?.MM_EAN_VARIANT_MARM_GTIN_VARIANT || null,
                        "MM_HEIGHT_MARM_HOEHE": item?.MM_HEIGHT_MARM_HOEHE || "0.000",
                        "MM_LENGTH_MARM_LAENG": item?.MM_LENGTH_MARM_LAENG || "0.000",
                        "MM_LUN_MARM_MESUB": item?.MM_LUN_MARM_MESUB || null,
                        "materialListId": materialListId,
                        "MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT": item?.MM_MEASUREMENT_UNIT_TEXT_AUN_MARM_MSEHT || null,
                        "MM_MEASUREMENT_UNIT_TEXT_BUN_MARM_MSEHT": item?.MM_MEASUREMENT_UNIT_TEXT_BUN_MARM_MSEHT || null,
                        "MM_NATIONAL_CODE_MARM_STTPEC_NCODE": item?.MM_NATIONAL_CODE_MARM_STTPEC_NCODE || null,
                        "MM_N_CODE_T_MARM_STTPEC_NCODE_TY": item?.MM_N_CODE_T_MARM_STTPEC_NCODE_TY || null,
                        "MM_NET_WEIGHT_MARM_NTGEW": item?.MM_NET_WEIGHT_MARM_NTGEW || "0.000",
                        "newlyAdded": item?.newlyAdded == false ? false : true,
                        "MM_NUMERATOR_MARM_UMREZ": item?.MM_NUMERATOR_MARM_UMREZ || "0.000",
                        "MM_REGISTRATION_CODE_MARM_STTPEC_RCODE": item?.MM_REGISTRATION_CODE_MARM_STTPEC_RCODE || null,
                        "MM_SER_NUM_MANAG_TYPE_MARM_STTPEC_SERNO_MANAGED": item?.MM_SER_NUM_MANAG_TYPE_MARM_STTPEC_SERNO_MANAGED || null,
                        "MM_SERIALIZATION_INDICATOR_MARM_STTPEC_SERUSE": item?.MM_SERIALIZATION_INDICATOR_MARM_STTPEC_SERUSE || false,
                        "MM_UOM_SYNC_ACTIVE_FLAG_MARM_STTPEC_UOM_SYNC": item?.MM_UOM_SYNC_ACTIVE_FLAG_MARM_STTPEC_UOM_SYNC || false,
                        "MM_UNIT_OF_DIMENSION_MARM_MEABM": item?.MM_UNIT_OF_DIMENSION_MARM_MEABM || null,
                        "MM_WEIGHT_UNIT_MARM_GEWEI": item?.MM_WEIGHT_UNIT_MARM_GEWEI || null,
                        "MM_NUMBER_MARM_AZSUB": item?.MM_NUMBER_MARM_AZSUB || null,
                        "MM_VOLUME_MARM_VOLUM": item?.MM_VOLUME_MARM_VOLUM || "0.000",
                        "MM_VOLUME_UNIT_MARM_VOLEH": item?.MM_VOLUME_UNIT_MARM_VOLEH || null,
                        "MM_WIDTH_MARM_BREIT": item?.MM_WIDTH_MARM_BREIT || "0.000",
                        "isDeleted": item?.isDeleted || false,
                        "isModified": item?.isModified || false
                    }
                    altUomPayload.push(altUomRowData);
                })
                return altUomPayload;
            },

            // fnHandleClassListDropdown: function (systemId) {
            //     let LookupModel = this.getModelDetails("LookupModel"),
            //         selectedClassList = LookupModel.getProperty(`/classificationClassList/${systemId}/ClassificationClass`);
            //     LookupModel.setProperty("/selectedSystemClassList", selectedClassList);
            // },

            //Uncomment the above function if needed to go to old state
            fnHandleClassListDropdown: function (systemId) {
                let LookupModel = this.getModelDetails("LookupModel"),
                    MaterialDetails = this.getModelDetails("MaterialDetails");

                // 1. Dropdown source list (all classes for that system)
                let selectedClassList = LookupModel.getProperty(`/classificationClassList/${systemId}/ClassificationClass`) || [];

                // 2. Allowed class list (system-wise whitelist) (Listed in LookupData.json file)
                let allowedClassList = LookupModel.getProperty(`/allowedClassList/${systemId}`) || [];

                // 3. Already existing classes in table
                let existingList = MaterialDetails.getProperty(`/AggregatedSystemDetails/${systemId}/Classification/classList`) || [];
                let existingClassNums = existingList.map(item => item.classnum);

                let filteredList = selectedClassList.filter(item =>
                    allowedClassList?.includes(item.classnum) &&        // Rule 1: allowed
                    !existingClassNums?.includes(item.classnum)         // Rule 2: not already used
                );

                LookupModel.setProperty("/selectedSystemClassList", filteredList);
            },


            // // Function to process classification data
            fnProcessClassificationData: function (oData) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    oDataSystemToId = LookupModel.getProperty("/oDataTargetSystemToId"),
                    ClassificationClass,
                    currentSystemId,
                    oldClassifcationData,
                    that = this,
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    aClassficationData;
                if (currentView == "CreateProject" && (requestType == "1" || requestType == "2")) {
                    // Don't copy data
                    return;
                }
                oData.forEach(function (item) {
                    let classList = [],
                        classDependentFields = {};
                    currentSystemId = oDataSystemToId[item?.SAP__Origin];
                    ClassificationClass = LookupModel.getProperty(`/classificationClassList/${currentSystemId}/ClassificationClass`);
                    aClassficationData = item.ToClassification?.results;
                    aClassficationData.map(function (ofield) {
                        let fieldName = null,
                            value = null,
                            valueDesc = null,
                            classListobj = {
                                "classnum": ofield?.classnum,
                                "Descrption": ofield?.Descrption,
                                "newlyAdded": false,
                                "isEdited": false,
                                "classificationListId": null
                            };
                        classDependentFields[ofield?.classnum] = { "toClassificationItem": {}, "toClassificationItemDesc": {} };
                        let mappedObj = ClassificationClass.find(obj =>
                            obj.classnum == ofield?.classnum
                        );
                        classListobj.Descrption = mappedObj.Descrption;
                        classList.push(classListobj);
                        for (let fieldObj of ofield?.toClassificationItem?.results) {
                            fieldName = fieldObj?.Characteristic;
                            value = fieldObj?.ValueNeutralLong == "I" ? fieldObj?.ValueChar : fieldObj?.ValueNeutral;
                            valueDesc = fieldObj?.ValueChar;
                            classDependentFields[ofield?.classnum]["toClassificationItem"][fieldName] = value;
                            classDependentFields[ofield?.classnum]["toClassificationItemDesc"][fieldName] = valueDesc;

                        }
                    })
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classDependentFields`, structuredClone(classDependentFields));
                    MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classList`, structuredClone(classList));
                    oldClassifcationData = that._fnCreateClassificationPayload(currentSystemId);
                    MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/classificationData`, JSON.parse(JSON.stringify(oldClassifcationData)));
                })
            },

            _fnCreateClassificationPayload: function (currentSystemId) {
                let materialDetailsModel = this.getModelDetails("MaterialDetails"),
                    oldMaterialListDetailsDto = materialDetailsModel.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}`),
                    aOldClassificationData = oldMaterialListDetailsDto?.classificationData || [],
                    aClassfication = [],
                    existingclassnuminOldpayload = {},
                    classDependentFields = materialDetailsModel.getProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classDependentFields`),
                    classList = materialDetailsModel.getProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classList`);

                for (let idx = 0; idx < aOldClassificationData.length; idx++) {
                    let key = aOldClassificationData[idx].classnum;
                    existingclassnuminOldpayload[key] = idx;
                }

                classList?.map(function (listItem) {
                    let obj = {
                        "classificationListId": null,
                        "classnum": listItem?.classnum,
                        "newlyAdded": listItem?.newlyAdded == false ? false : true,
                        "isEdited": listItem?.isEdited,
                        "toClassificationItem": {},
                        "toClassificationItemDesc": {}
                    };
                    if (classDependentFields[listItem?.classnum]?.toClassificationItem) {
                        obj.toClassificationItem = classDependentFields[listItem?.classnum]?.toClassificationItem;
                        obj.toClassificationItemDesc = classDependentFields[listItem?.classnum]?.toClassificationItemDesc;
                        obj.classificationListId = listItem?.classificationListId || null;
                    }
                    else {
                        let key = listItem?.classnum;
                        if (key in existingclassnuminOldpayload) {
                            obj.toClassificationItem = aOldClassificationData[existingclassnuminOldpayload[key]]?.toClassificationItem;
                            obj.classificationListId = aOldClassificationData[existingclassnuminOldpayload[key]]?.classificationListId;
                            obj.toClassificationItemDesc = aOldClassificationData[existingclassnuminOldpayload[key]]?.toClassificationItemDesc;
                        }
                    }
                    aClassfication.push(obj);
                })

                return aClassfication;
            },

            onSelectClassification: function (oEvent, isEditClicked = false) {
                let oSelectedObject = oEvent?.getSource()?.getBindingContext("MaterialDetails")?.getObject(),
                    selectedPath = oEvent?.getSource()?.getBindingContext("MaterialDetails")?.getPath(),
                    selectedIndex = selectedPath?.slice(selectedPath.lastIndexOf('/') + 1),
                    sClassificationUrl = '/ClassificationItemSet',
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    Classtype = MaterialDetails.getProperty("/SystemDetails/Classification/Classtype"),
                    that = this,
                    sFilter = `classnum eq '${oSelectedObject.classnum}' and Classtype eq '${Classtype}'`,
                    sExpandEntityName = "ToCharacterValue",
                    classOutline = null,
                    LookupModel = this.getModelDetails("LookupModel"),
                    systemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                    dropdownModelName = LookupModel.getProperty(`/oDataTargetSystemIdToModelClassification/${systemId}`);
                try {
                    classOutline = MaterialDetails.getProperty("/SystemDetails/Classification/classDependentFields/" + oSelectedObject.classnum + "/classOutline");
                }
                catch (e) { }

                if (!classOutline) {
                    this.fnGetOdataService(dropdownModelName, sClassificationUrl, sFilter, sExpandEntityName).then(function (responseData) {
                        that.fnToRenderClassification(responseData.results, oSelectedObject, isEditClicked);
                    });
                }
                else {
                    that.fnToRenderClassification(classOutline, oSelectedObject, isEditClicked);
                }
            },

            fnClassFieldsEmptyValidCheck: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    systemLookup = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    that = this,
                    systemDataDetails = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    isMandate = true,
                    oAppModel = this.getModelDetails("oAppModel"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType"),
                    missingClassFields = [];
                // if (wfTaskType != "GMDM_WF_Task") {
                //     return true;
                // }
                systemDataDetails?.map(item => {
                    if (item?.isIncluded) {
                        let isNonEmptyClassFields = false,
                            systemText = null,
                            classDependentFields = MaterialDetails.getProperty(`/AggregatedSystemDetails/${item?.MM_SYSTEM_ID}/Classification/classDependentFields`),
                            classList = MaterialDetails.getProperty(`/AggregatedSystemDetails/${item?.MM_SYSTEM_ID}/Classification/classList`),
                            editedClassNum = MaterialDetails.getProperty(`/AggregatedSystemDetails/${item?.MM_SYSTEM_ID}/Classification/editClassification/editSelectedClassNum`);
                        classList?.map(listItem => {
                            if (listItem?.classnum == editedClassNum) {
                                let classificationItem = classDependentFields[listItem?.classnum]?.toClassificationItem;
                                isNonEmptyClassFields = Object.values(classificationItem)?.some(value => value !== "" && value !== null && value !== undefined);
                            }
                        })

                        try {
                            let mappedObj = systemLookup?.find(obj =>
                                obj?.MM_KEY == item?.MM_SYSTEM_ID
                            );
                            systemText = mappedObj?.MM_SYSTEM_REF_LIST_CODE || null;
                        }
                        catch (e) { }

                        if (!isNonEmptyClassFields && editedClassNum) {
                            isMandate = false;
                            missingClassFields.push(
                                {
                                    "systemId": systemText,
                                    "className": editedClassNum
                                }
                            )
                        }
                    }
                })
                return isMandate == true ? isMandate : missingClassFields;
            },

            onEditAsgnmtClass: function (oEvent) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    selectedPath = oEvent?.getSource()?.getBindingContext("MaterialDetails")?.getPath(),
                    editSelectedClassNum = MaterialDetails?.getProperty(selectedPath)?.classnum,
                    isEditClicked = true;
                // oClassificationTable = this.byId("classificationTable"),
                // aItems = oClassificationTable.getItems();

                // aItems?.forEach(function (oItem) {
                //     let oEditButton = oItem?.getCells()[2]?.getItems()[0]; 
                //     oEditButton?.setVisible(false);
                // });

                // let oSelectedRow = aItems[selectedIndex];
                // var oEditButton = oSelectedRow?.getCells()[2]?.getItems()[0];
                // oEditButton?.setVisible(true);
                // oEditButton?.setEnabled(true);

                MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/editSelectedClassNum", editSelectedClassNum);
                (MaterialDetails.getProperty(selectedPath)).isEdited = true;
                MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/isEditPerformed", true);

                this.onSelectClassification(oEvent, isEditClicked);
            },

            fnHandleClassificationItemsFieldEditable: function () {
                let oAppModel = this.getModelDetails("oAppModel"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    Repository = this.getModelDetails("Repository"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    s_WF_Requestor = "Request_Form_Submission",
                    s_WF_Rework = "Requester_Rework_WF_Task",
                    s_WF_GMDM = "GMDM_WF_Task",
                    s_WF_GQMD = "GQMD_WF_Task",
                    id_MS_Draft = 1,
                    id_MS_Inprogress = 2,
                    id_MS_Syndicated = 9,
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType");
                if (currentView == "CreateProject") {
                    let isUserRequestOwner = CreateProject.getProperty("/GeneralData/isUserRequestOwner"),
                        materialStatusId = CreateProject.getProperty("/MaterialList/selectedMaterialData/materialStatusId"),
                        requestType = CreateProject.getProperty("/RequestHeader/data/requestType");
                    if (!isUserRequestOwner && wfTaskType == s_WF_Requestor) {
                        return false;
                    }
                    if (requestType == "3") {
                        if ((wfTaskType === s_WF_Requestor && (materialStatusId == null || materialStatusId == id_MS_Draft)) || (wfTaskType === s_WF_Rework && materialStatusId == id_MS_Inprogress) || (wfTaskType === s_WF_GMDM && materialStatusId != id_MS_Syndicated) || (wfTaskType === s_WF_GQMD && materialStatusId != id_MS_Syndicated)) {
                            return true;
                        }
                    }
                } else if (currentView == "Repository") {
                    let repoSubmitFor = Repository.getProperty("/MaterialSelected/repoSubmitFor");
                    if (repoSubmitFor == "Modify") {
                        return true;
                    }
                }
                return false;
            },

            fnToRenderClassification: async function (aFields, oSelectedObject, isEditClicked) {
                let that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    classficationVBoxID = this.getView().byId("MM_VBoxClassification"),
                    sClassDesc = oSelectedObject?.Descrption,
                    currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                    sClassnum = oSelectedObject.classnum,
                    MaterialDetailsLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MaterialDetails.json"),
                    MaterialDetailsLocalModel = new JSONModel(),
                    MaterialDetailsLocalModelData;

                that.getView().setModel(MaterialDetailsLocalModel, "MaterialDetailsLocalModel");
                await MaterialDetailsLocalModel.loadData(MaterialDetailsLocation);

                MaterialDetailsLocalModelData = MaterialDetailsLocalModel.getData();

                classficationVBoxID.removeAllItems();

                sClassDesc = sClassDesc === "" || sClassDesc === null || sClassDesc === undefined ? sClassnum : sClassDesc;
                let cPanel = that.fnCreatePanel(sClassDesc),
                    cGrid = that.fnCreateGrid(),
                    classPath = "/SystemDetails/Classification/classDependentFields/" + sClassnum,
                    toClassificationItem = MaterialDetails.getProperty(classPath + "/toClassificationItem") || {},
                    toClassificationItemDesc = MaterialDetails.getProperty(classPath + "/toClassificationItemDesc") || {},
                    classificationItemEditable = MaterialDetails.getProperty("/SystemDetails/Classification/classificationItemEditable"),
                    dataOutline = {
                        "classificationListId": null,
                        "toClassificationItem": toClassificationItem || {},//If data exists then set the old data or else {}.
                        "toClassificationItemDesc": toClassificationItemDesc || {},
                        "MM_VISIBILITY": {},
                        "MM_MANDATORY": {},
                        "MM_EDITABLE": {},
                        "MM_MAX_CHAR_LENGTH": {},
                        "valueState": {},
                        "classOutline": aFields
                    };
                // MaterialDetails.setProperty("/SystemDetails/Classification/classDependentFields", JSON.parse(JSON.stringify(MaterialDetailsLocalModelData.SystemDetails.Classification.classDependentFields)));
                

                //check if sClassnum is already present in class dependent property
                var classNumList = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/classificationData`);
                let mappedObj = classNumList?.find(obj =>
                    obj.classnum == sClassnum
                );
                var isOld = false;
                if (mappedObj) isOld = true;


                MaterialDetails.setProperty(classPath, dataOutline);

                if(MaterialDetailsLocalModelData.SystemDetails.Classification?.classDependentFields[sClassnum]?.MM_EDITABLE[currentSystemId]){
                    MaterialDetails.setProperty(`${classPath}/MM_EDITABLE/${currentSystemId}`, JSON?.parse(JSON?.stringify(MaterialDetailsLocalModelData.SystemDetails.Classification?.classDependentFields[sClassnum]?.MM_EDITABLE[currentSystemId])));
                }
                
                aFields.map(function (field) {

                    //if isOld, then check if field is present in class dependent property
                    //if present, proceed .
                    //else skip to the next field

                    if (!isOld || (isOld && toClassificationItem.hasOwnProperty(field?.Characteristic))) {

                        let fieldName = field?.Characteristic,
                            P_MaxChar = 50,
                            P_DefaultValue = field?.ValueNeutral,
                            // PP_LabelName = "{i18n>" + fieldName + "}",
                            PP_LabelName = field?.CharactDescr || fieldName;
                            // P_Editable = "{MaterialDetails>" + classPath + "/MM_EDITABLE/" + fieldName + "}",
                            // P_Editable = that.fnHandleClassificationItemsFieldEditable(),
                            // P_Editable = "{MaterialDetails>" + classPath + "/MM_EDITABLE/" + currentSystemId + "/" + fieldName + "}",

                            // ---------------- EDITABILITY LOGIC ----------------
                            // Determine final editable value
                                let jsonEditable = MaterialDetailsLocalModelData.SystemDetails.Classification.classDependentFields[sClassnum]?.MM_EDITABLE[currentSystemId]?.[fieldName],

                                // finalEditable logic (default = true when JSON has no value)
                                finalEditable = isEditClicked ? (jsonEditable ?? true) : false;

                                if(MaterialDetails.getProperty(`${classPath}/MM_EDITABLE/${currentSystemId}`)){
                                    MaterialDetails.setProperty(`${classPath}/MM_EDITABLE/${currentSystemId}/${fieldName}`, finalEditable);
                                }
                                else{
                                    MaterialDetails.setProperty(`${classPath}/MM_EDITABLE/${currentSystemId}`, {});
                                    MaterialDetails.setProperty(`${classPath}/MM_EDITABLE/${currentSystemId}/${fieldName}`, finalEditable);
                                }
    
                            // Bind editable to UI
                            // let P_Editable = `{MaterialDetails>${classPath}/MM_EDITABLE/${currentSystemId}/${fieldName}}`,
                            let P_Editable = "{MaterialDetails>" + classPath + "/MM_EDITABLE/" + currentSystemId + "/" + fieldName + "}",


                            P_Visible = true,
                            P_FieldType = "Text",
                            PP_ValueState = "{MaterialDetails>" + classPath + "/valueState/" + fieldName + "}",
                            PP_Mandatory = "{MaterialDetails>" + classPath + "/MM_MANDATORY/" + fieldName + "}",
                            PP_Visible = "{MaterialDetails>" + classPath + "/MM_VISIBILITY/" + fieldName + "}",
                            PP_PlaceholderText_Enter = "{i18n>Enter} {i18n>" + fieldName + "}",
                            PP_PlaceholderText_Select = "{i18n>Select} {i18n>" + fieldName + "}",
                            PP_Value = "", PP_Item = "", PP_Key = "", PP_ItemKey = "", PP_ItemDesc = "", PP_Selected_Key_Desc = "",
                            cVBox = that.fnCreateVBox(true),
                            cLabel = that.fnCreateLabel(PP_LabelName, PP_Mandatory),
                            cData = null,
                            fieldType;
                        cVBox.addItem(cLabel);
                        MaterialDetails.setProperty(classPath + "/MM_MANDATORY/" + fieldName, false);
                        MaterialDetails.setProperty(classPath + "/MM_VISIBILITY/" + fieldName, P_Visible);
                        MaterialDetails.setProperty(classPath + "/MM_MAX_CHAR_LENGTH/" + fieldName, P_MaxChar);
                        MaterialDetails.setProperty(classPath + "/valueState/" + fieldName, "None");
                        if (field?.ToCharacterValue?.results === undefined) {
                            fieldType = "InputText";
                        } else {
                            fieldType = field?.ToCharacterValue?.results?.length === 0 ? "InputText" : "Dropdown";
                        }
                        //Default value to be set if data doesnot exist
                        if (P_DefaultValue !== `""` && (Object.keys(toClassificationItem).length === 0 && toClassificationItem.constructor === Object)) {
                            MaterialDetails.setProperty(classPath + "/toClassificationItem/" + fieldName, P_DefaultValue);
                        }

                        if (!MaterialDetails.getProperty(`${classPath}/toClassificationItem/${fieldName}`)) {
                            MaterialDetails.setProperty(`${classPath}/toClassificationItem/${fieldName}`, "");
                        }

                        switch (fieldType) {
                            case "InputText":
                                PP_Value = "{MaterialDetails>" + classPath + "/toClassificationItem/" + fieldName + "}";
                                cData = that.fnCreateInputClassification(PP_Value, PP_PlaceholderText_Enter, P_MaxChar, P_Editable, P_FieldType, PP_ValueState);
                                break;

                            case "Dropdown":
                                LookupModel.setProperty("/" + fieldName, field.ToCharacterValue?.results);
                                let P_SecValue = true;
                                PP_Key = "{MaterialDetails>" + classPath + "/toClassificationItem/" + fieldName + "}";
                                PP_Selected_Key_Desc = "{MaterialDetails>" + classPath + "/toClassificationItemDesc/" + fieldName + "}";
                                PP_Item = "LookupModel>/" + fieldName;
                                PP_ItemKey = `{LookupModel>CharValue}`;
                                PP_ItemDesc = "{LookupModel>DescrCval}";
                                PP_Value = "";

                                cData = that.fnCreateClassificationComboBox(PP_Key, PP_PlaceholderText_Select, PP_Item, PP_ItemKey, PP_ItemDesc, P_SecValue, P_Editable, PP_ValueState, (oEvent) => {
                                    // that.fnHandleComboboxValidation(oEvent);
                                    let selectedPath = oEvent.getSource().getBindingInfo("selectedKey").binding.sPath;
                                    selectedPath = selectedPath.replace("toClassificationItem", "toClassificationItemDesc");
                                    let selectedKeyDescription = oEvent.getSource().getItemByKey(oEvent.getSource().getSelectedKey())?.mProperties.text;

                                    if (!selectedKeyDescription) selectedKeyDescription = null;

                                    MaterialDetails.setProperty(selectedPath, selectedKeyDescription);

                                });
                                break;
                        }
                        cVBox.addItem(cData);
                        cGrid.addContent(cVBox);

                    }
                });
                cPanel.addContent(cGrid);
                classficationVBoxID.insertItem(cPanel);
            },

            fnCreateInputClassification: function (PP_Value, PP_PlaceholderText, P_MaxChar, P_Editable, P_FieldType, PP_ValueState) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    cInput = new sap.m.Input({
                        width: "100%",
                        value: PP_Value,
                        valueState: PP_ValueState,
                        placeholder: PP_PlaceholderText,
                        maxLength: P_MaxChar,
                        editable: P_Editable,
                        type: P_FieldType,
                        change: function (oEvent) {
                            let selectedPath = oEvent?.getSource()?.getBindingInfo("value")?.binding?.sPath;
                            selectedPath = selectedPath.replace("toClassificationItem", "toClassificationItemDesc");
                            let selectedInputDescription = oEvent?.getSource()?.getValue();
                            if (!selectedInputDescription) selectedInputDescription = null;
                            MaterialDetails.setProperty(selectedPath, selectedInputDescription);
                        }
                    });
                cInput.addStyleClass("MM_InputText");
                return cInput;
            },

            fnCreateClassificationComboBox: function (PP_Key, placeholderText, PP_Item, PP_ItemKey, PP_ItemDesc, P_SecValue, PP_Editable, PP_ValueState, changeEvent) {
                let cComboBox = new sap.m.ComboBox({
                    // selectedKey: PP_Key,
                    value: PP_Key,
                    valueState: PP_ValueState,
                    placeholder: placeholderText,
                    editable: true,
                    width: "100%",
                    showSecondaryValues: P_SecValue,
                    filterSecondaryValues: true,
                    editable: PP_Editable,
                    items: {
                        path: PP_Item,
                        template: new sap.ui.core.ListItem({
                            key: PP_ItemKey,
                            text: PP_ItemKey,
                            additionalText: PP_ItemDesc
                        })
                    },
                    change: changeEvent
                });
                cComboBox.addStyleClass("MM_ComboBox");
                return cComboBox;
            },

            // add Assignment Class
            onAddAssigmentClass: function (oEvent) {
                //Initialize validation model with null
                let materialDetailsModel = this.getModelDetails("MaterialDetails"),
                    systemId = materialDetailsModel.getProperty("/SystemData/targetSystem");
                materialDetailsModel.setProperty("/SystemDetails/Classification/clsAsgnmntClassValueState", "None");
                materialDetailsModel.setProperty("/SystemDetails/Classification/clsAsgnmntClassValueStateText", "");
                materialDetailsModel.setProperty("/SystemDetails/Classification/classnum", null);

                //Update the class list
                this.fnHandleClassListDropdown(systemId);
                //Create dialog instance      
                this.LoadFragment("Classification_AssignmentClass", this.getView());
            },

            pressAssignmentClassDialogOk: function () {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    listofAddedClasses = JSON.parse(JSON.stringify(MaterialDetails.getProperty("/SystemDetails/Classification/classList"))),
                    selectedClass = MaterialDetails.getProperty("/SystemDetails/Classification/classnum"),
                    listofAllClasses = LookupModel.getProperty("/selectedSystemClassList"),
                    oClassificationTable = this?.byId("classificationTable"),
                    that = this,
                    SelectedClassObject = listofAllClasses.find(classobj => classobj.classnum == selectedClass);

                if (selectedClass === "" || selectedClass === undefined || selectedClass === null) {
                    MaterialDetails.setProperty("/SystemDetails/Classification/clsAsgnmntClassValueState", "Error");
                    MaterialDetails.setProperty("/SystemDetails/Classification/clsAsgnmntClassValueStateText", this.geti18nText("selectClass"));
                    return;
                }
                for (let obj of listofAddedClasses) {
                    if (obj?.classnum == selectedClass) {
                        this.getView().byId("id_Classification_AssClass").close();
                        return;
                    }
                }

                SelectedClassObject.isEdited = true;

                listofAddedClasses.push(SelectedClassObject);
                MaterialDetails.setProperty("/SystemDetails/Classification/classList", listofAddedClasses);
                MaterialDetails.setProperty("/SystemDetails/Classification/classnum", null);

                MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/isNewAddedClass", true);
                MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/editSelectedClassNum", selectedClass);
                MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/isEditPerformed", true);

                let aItems = oClassificationTable?.getItems();
                aItems?.forEach(function (oItem) {
                    let oContext = oItem?.getBindingContext("MaterialDetails");
                    if (oContext && oContext?.getProperty("classnum") == selectedClass) {
                        oClassificationTable?.setSelectedItem(oItem);
                        let oEvent = {
                            getSource: function () {
                                return oItem;
                            }
                        };
                        that.onSelectClassification(oEvent);
                    }
                });


                this.getView().byId("id_Classification_AssClass").close();
            },

            pressAssignmentClassDialogCancel: function () {
                this.getView().byId("id_Classification_AssClass").close();
            },

            onDeleteAsgnmtClass: async function (oEvent) {
                let actions = ["NO", "YES"],
                    that = this,
                    spath = oEvent.getSource().getBindingContext("MaterialDetails").sPath,
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    requestNumber = currentView == "CreateProject" ? CreateProject.getProperty("/RequestHeader/data/requestNumber") : null,
                    confirmationMsg = this.resourceBundle.getText("deleteConfirmation");
                await this.showMessage(confirmationMsg, "Q", actions, "YES", async function (action) {
                    if (action == "YES") {
                        let MaterialDetails = that.getModelDetails("MaterialDetails"),
                            listofAddedClasses = MaterialDetails.getProperty("/SystemDetails/Classification/classList"),
                            selectedClass = MaterialDetails.getProperty(spath)?.classnum,
                            currentSystemId = MaterialDetails.getProperty("/SystemData/targetSystem"),
                            aOldClassificationData = MaterialDetails.getProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/classificationData`),
                            materialListId = that.fnGetMaterialDetailsSelectedData("materialListId"),
                            listAfterDeletion,
                            isNewlyAddedClass = true;

                        aOldClassificationData?.map(item => {
                            if (item.classnum == selectedClass) {
                                isNewlyAddedClass = false;
                            }
                        })

                        if (!isNewlyAddedClass && materialListId) {
                            await that.fnDeleteClassification(selectedClass, materialListId, requestNumber, currentSystemId);
                            let aggregateClassList = MaterialDetails.getProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classList`),
                                aggregateClassDependentFields = MaterialDetails.getProperty(`/AggregatedSystemDetails/${currentSystemId}/Classification/classDependentFields`);
                            MaterialDetails.setProperty("/SystemDetails/Classification/classList", aggregateClassList);
                            MaterialDetails.setProperty("/SystemDetails/Classification/classDependentFields", aggregateClassDependentFields);
                        } else {
                            listAfterDeletion = listofAddedClasses.filter(classobj => classobj.classnum != selectedClass);
                            MaterialDetails.setProperty("/SystemDetails/Classification/classList", listAfterDeletion);
                            that.getView().byId("MM_VBoxClassification").removeAllItems();
                            MaterialDetails.setProperty("/SystemDetails/Classification/classDependentFields/" + selectedClass, {});
                        }
                        MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/isEditPerformed", false);
                        MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/editSelectedClassNum", null);
                        MaterialDetails.setProperty("/SystemDetails/Classification/editClassification/isNewAddedClass", false);
                    }
                });
            },

            fnDeleteClassification: function (selectedClass, materialListId, requestNumber, currentSystemId) {
                return new Promise((resolve, reject) => {
                    let payload = {
                        "className": selectedClass,
                        "materialListId": materialListId,
                        "requestNumber": requestNumber,
                        "systemId": currentSystemId
                    },
                        oAppModel = this.getModelDetails("oAppModel"),
                        viewName = oAppModel.getProperty("/sideNavigation/currentView"),
                        that = this;
                    this.fnProcessDataRequest("MM_JAVA/deleteClassification", "DELETE", null, true, payload,
                        async function (responseData) {
                            await that.getDatabyMaterialListId(materialListId);
                            that.onGetFilteredDataMatChangeLog(viewName, true);
                            that.closeBusyDialog();
                            resolve();
                        },
                        function (error) {
                            that.closeBusyDialog();
                            reject();
                        }
                    );
                })
            },

            //Remove classification class attributes.
            fnRemoveClassificationClassAttributes: function () {
                let materialDetailsModel = this.getModelDetails("MaterialDetails");
                materialDetailsModel.setProperty("/SystemDetails/Classification/SelectedClass", []);
                materialDetailsModel.setProperty("/SystemDetails/Classification/aExistClass", []);
                materialDetailsModel.setProperty("/SystemDetails/Classification/deletedClass", []);
                materialDetailsModel.setProperty("/SystemDetails/Classification/aggregateClass", {});
                if (this.getView().byId("MM_VBoxClassification")) {
                    let classficationVBoxID = this.getView().byId("MM_VBoxClassification");
                    classficationVBoxID.removeAllItems();
                }
            },

            //function to process basic data
            fnProcessBasicData: async function (oData) {
                var that = this, basicData, basicData1Dto = {}, basicData2Dto = {}, iSerializationType = null,
                    materialSelected = {}, currentSystemId = "", systemExits = null, iLastSynchronized = null,
                    selectedSystem = {}, repositorySystemStatusId = null, validFrom = null,
                    oAppModel = this.getModelDetails("oAppModel"),
                    currentView = oAppModel.getProperty("/sideNavigation/currentView"),
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    CreateProject = this.getModelDetails("CreateProject"),
                    LookUpModel = this.getModelDetails("LookupModel"),
                    oDataSystemToId = LookUpModel.getProperty("/oDataTargetSystemToId"),
                    repositoryModel = this.getModelDetails("Repository"),
                    withReferenceFlag = CreateProject.getProperty("/MaterialList/existingMaterial/withReferenceFlag"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    baseUomRefList = LookUpModel.getProperty("/MM_UOM_REF_LIST"),
                    requestType = this.fnGetRequestHeaderData("requestType");

                oData.forEach(function (item) {
                    basicData = item?.ToClientData;
                    currentSystemId = oDataSystemToId[item?.SAP__Origin];
                    systemExits = selectedSystems.some(item => item.MM_SYSTEM_ID == currentSystemId);
                    selectedSystem = selectedSystems?.find(system => system?.MM_SYSTEM_ID == currentSystemId);
                    repositorySystemStatusId = selectedSystem ? selectedSystem?.repositorySystemStatusId : null;
                    if (currentView == "CreateProject" && requestType == 3 && (repositorySystemStatusId == 10 || repositorySystemStatusId == 11)) {
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1`, {});
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2`, {});
                        MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/basicData1Dto`, {});
                        MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/basicData2Dto`, {});
                    }
                    else if (currentView == "CreateProject" && requestType == 1 && repositorySystemStatusId == 10) { }
                    else if (systemExits) {
                        iLastSynchronized = (basicData.LastSynchronized === (undefined || "0")) ? null : basicData.LastSynchronized;
                        let purStatusVal = basicData?.PurStatus == "" ? "BLANK" : basicData?.PurStatus;
                        validFrom = basicData?.Pvalidfrom ? that.onGetDateConvertFormat(basicData?.Pvalidfrom, "ymdhms") : null;
                        iLastSynchronized = iLastSynchronized ? that.convertDateFormat(iLastSynchronized) : iLastSynchronized;
                        basicData1Dto = {
                            "generalData": {
                                "MM_INDUSTRY_SECTOR_MARA_MBRSH": item.IndSector,
                                "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS": formatter.getBaseUomKey(basicData.BaseUom, baseUomRefList),
                                "MM_MATERIAL_GROUP_MARA_MATKL": basicData.MatlGroup,
                                "MM_OLD_MATERIAL_NUMBER_MARA_BISMT": basicData.OldMatNo,
                                "MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG": basicData.Extmatlgrp,
                                "MM_DIVISION_MARA_SPART": basicData.Division,
                                "MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR": basicData.DsnOffice,
                                "MM_PRODUCT_ALLOCATION_MARA_KOSCH": basicData.ProdAlloc,
                                "MM_PRODUCT_HIERARCHY_MARA_PRDHA": basicData.ProdHier,
                                "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE": purStatusVal,
                                "MM_VALID_FROM_MARA_DATAB": validFrom,
                                "MM_ASSIGN_EFFECT_VALS_MARA_KZEFF": basicData.ParEff,
                                "MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA": basicData.ItemCat
                            },
                            "shippingData": {
                                "MM_TRANSPORTATION_GROUP_MARA_TRAGR": basicData?.TransGrp
                            },
                            "matAuthGroup": {
                                "MM_AUTHORIZATION_GROUP_MARA_BEGRU": basicData.Authoritygroup
                            },
                            "dimensionsEans": {
                                "MM_GROSS_WEIGHT_MARA_BRGEW": basicData.GrossWeight,
                                "MM_WEIGHT_UNIT_MARM_GEWEI": basicData.UnitOfWt,
                                "MM_NET_WEIGHT_MARA_NTGEW": basicData.NetWeight,
                                "MM_VOLUME_MARM_VOLUM": basicData.Volum,
                                "MM_VOLUME_UNIT_MARM_VOLEH": basicData.Volumeunit,
                                "MM_SIZE_DIMENSIONS_MARA_GROES": basicData.SizeDim,
                                "MM_EAN_UPC_MARA_EAN11": basicData.EANUPC,
                                "MM_EAN_CATEGORY_MARA_NUMTP": basicData.EANCategory
                            },
                            "packagingMatData": {
                                "MM_MATL_GRP_PACK_MATLS_MARA_MAGRV": basicData.MatGrpSm,
                                "MM_REF_MAT_FOR_PCKG_MARA_RMATP": basicData.PlRefMat
                            },
                            "advTrackTrace": {
                                "MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE": basicData.SerializationType,
                                "MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF": basicData.ProfRelCountry,
                                "MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT": basicData.ProductCategory,
                                "MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT": basicData.SyncActive,
                                "MM_LAST_SYNCHRONIZED_MARA_DATS": iLastSynchronized
                            }
                        };

                        if (withReferenceFlag && requestType == 1) { // For Create with Refrence, the XPlant Material Status should be based on the Material Life Cycle Status in Product Data
                            let lifeCycleMapping = LookUpModel.getProperty("/MM_MATERIAL_LIFE_CYCLE_STATUS_MAPPING_RULE"),
                                mappedObj = {},
                                sLifecycle = that.onGetProductDataValue("1025")?.sValue; // Lifecycle Status in Product Data
                            currentSystemId = parseInt(currentSystemId);
                            try {
                                mappedObj = lifeCycleMapping?.find(function (mapRule) {
                                    let applicableSystemIDs = mapRule.MM_SYSTEM;
                                    if (applicableSystemIDs?.includes(currentSystemId) && mapRule?.MM_MATERIAL_LIFE_CYCLE_STATUS_MAPPING_RULE_CODE == sLifecycle) {
                                        return mapRule;
                                    }
                                })
                                basicData1Dto.generalData.MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE = mappedObj?.MM_X_PLANT_MATERIAL_STATUS;
                            } catch (e) { }
                        }

                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/generalData/data`, basicData1Dto.generalData);
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/shippingData/data`, basicData1Dto.shippingData);
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/matAuthGroup/data`, basicData1Dto.matAuthGroup);
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/dimensionsEans/data`, basicData1Dto.dimensionsEans);
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/packagingMatData/data`, basicData1Dto.packagingMatData);
                        MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData1/advTrackTrace/data`, basicData1Dto.advTrackTrace);

                        if (!withReferenceFlag) {  //For Copy From Reference Material requirement is to copy only Basic Data 1
                            basicData2Dto = {
                                "otherData": {
                                    "MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH": basicData.ProdMemo,
                                    "MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT": basicData.Pageformat,
                                    "MM_IND_DESCRIPTION_MARA_NORMT": basicData.StdDescr,
                                    "MM_CAD_INDICATOR_MARA_CADKZ": basicData.CadId,
                                    "MM_BASIC_MATERIAL_MARA_WRKST": basicData.BasicMatl,
                                    "MM_MEDIUM_MARA_MEDIUM": basicData.Medium
                                },
                                "environment": {
                                    "MM_DG_INDICATOR_PROFILE_MARA_PROFL": basicData.Hazmatprof,
                                    "MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW": basicData.EnvtRlvt,
                                    "MM_IN_BULK_LIQUID_MARA_ILOOS": basicData.Looseorliq,
                                    "MM_HIGHLY_VISCOS_MARA_IHIVI": basicData.HighVisc,
                                },
                                "designDocAssigned": {
                                    "MM_NO_LINK": basicData.noLink, //tbd
                                },
                                "designdrawing": {
                                    "MM_DOCUMENT_MARA_ZEINR": basicData.Document,
                                    "MM_DOCUMENT_TYPE_MARA_ZEIAR": basicData.DocType,
                                    "MM_DOCUMENT_VERSION_MARA_ZEIVR": basicData.DocVers,
                                    "MM_PAGE_NUMBER_MARA_BLATT": basicData.PageNo,
                                    "MM_DOC_CH_NO_MARA_AESZN": basicData.DocChgNo,
                                    "MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO": basicData.DocFormat,
                                    "MM_NO_SHEETS_MARA_BLANZ": basicData.NoSheets
                                },
                                "clientSpecificConfig": {
                                    "MM_CROSS_PLANT_CM_MARA_SATNR": basicData.crossPlantCm, //tbd
                                    "MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG": basicData.matIsConfigurable, //tbd
                                    "MM_VARIANT": basicData.GtinVariant,
                                },
                            }
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/otherData/data`, basicData2Dto.otherData);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/environment/data`, basicData2Dto.environment);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/designDocAssigned/data`, basicData2Dto.designDocAssigned);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/designdrawing/data`, basicData2Dto.designdrawing);
                            MaterialDetails.setProperty(`/AggregatedSystemDetails/${currentSystemId}/basicData2/clientSpecificConfig/data`, basicData2Dto.clientSpecificConfig);

                            if ((currentView == "CreateProject" && requestType == 2 && (repositorySystemStatusId == 10 || repositorySystemStatusId == 11)) || ((currentView == "Repository") && (repositorySystemStatusId == 10 || repositorySystemStatusId == 11))) {
                                MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/basicData1Dto`, {});
                                MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/basicData2Dto`, {});
                            }
                            else {
                                try {
                                    let oldBasicData1, oldBasicData2,
                                        targetSystemExist = MaterialDetails.getProperty("/GeneralData/oldMaterialDetailsData/targetSystem");
                                    if (!targetSystemExist) {
                                        MaterialDetails.setProperty("/GeneralData/oldMaterialDetailsData/targetSystem", {});
                                    }
                                    iSerializationType = (basicData?.SerializationType === undefined) ? null : basicData.SerializationType;
                                    iLastSynchronized = (basicData?.LastSynchronized === (undefined || "0")) ? null : basicData.LastSynchronized;
                                    validFrom = basicData?.Pvalidfrom ? that.onGetDateConvertFormat(basicData?.Pvalidfrom, "ymdhms") : null;
                                    iLastSynchronized = iLastSynchronized ? that.convertDateFormat(iLastSynchronized) : iLastSynchronized;
                                    oldBasicData1 = {
                                        "MM_ASSIGN_EFFECT_VALS_MARA_KZEFF": basicData.ParEff || false,
                                        "MM_AUTHORIZATION_GROUP_MARA_BEGRU": basicData.Authoritygroup || null,
                                        "MM_DIVISION_MARA_SPART": basicData.Division || null,
                                        "MM_EAN_UPC_MARA_EAN11": basicData.EANUPC || null,
                                        "MM_EAN_CATEGORY_MARA_NUMTP": basicData.EANCategory || null,
                                        "MM_GENERAL_ITEM_CATEGORY_GROUP_MARA_MTPOS_MARA": basicData.ItemCat || null,
                                        "MM_TRANSPORTATION_GROUP_MARA_TRAGR": basicData?.TransGrp || null,
                                        "MM_GROSS_WEIGHT_MARA_BRGEW": basicData.GrossWeight || null,
                                        "MM_INDUSTRY_SECTOR_MARA_MBRSH": item.IndSector || null,
                                        "MM_LABORATORY_DESIGN_OFFICE_MARA_LABOR": basicData.DsnOffice || null,
                                        "MM_LAST_SYNCHRONIZED_MARA_DATS": iLastSynchronized,
                                        "MM_MATERIAL_GROUP_MARA_MATKL": basicData.MatlGroup || null,
                                        "MM_EXTERNAL_MATERIAL_GROUP_MARA_EXTWG": basicData.Extmatlgrp || null,
                                        "MM_MATL_GRP_PACK_MATLS_MARA_MAGRV": basicData.MatGrpSm || null,
                                        "materialListId": null,
                                        "MM_NET_WEIGHT_MARA_NTGEW": basicData.NetWeight || null,
                                        "MM_OLD_MATERIAL_NUMBER_MARA_BISMT": basicData.OldMatNo || null,
                                        "MM_PRODUCT_ALLOCATION_MARA_KOSCH": basicData.ProdAlloc || null,
                                        "MM_PRODUCT_CATEGORY_MARA_STTPEC_PRDCAT": basicData.ProductCategory || null,
                                        "MM_PRODUCT_HIERARCHY_MARA_PRDHA": basicData.ProdHier || null,
                                        "MM_PROF_REL_COUNTRY_MARA_STTPEC_COUNTRY_REF": basicData.ProfRelCountry || null,
                                        "MM_REF_MAT_FOR_PCKG_MARA_RMATP": basicData.PlRefMat || null,
                                        "MM_SERIALIZATION_TYPE_MARA_STTPEC_SERTYPE": iSerializationType,
                                        "MM_SIZE_DIMENSIONS_MARA_GROES": basicData.SizeDim || null,
                                        "MM_SYNCHRONIZATION_ACTIVE_MARA_STTPEC_SYNCACT": basicData.SyncActive || false,
                                        "MM_BASE_UNIT_OF_MEASURE_MARM_MEINS": formatter.getBaseUomKey(basicData.BaseUom, baseUomRefList) || null,
                                        "MM_VALID_FROM_MARA_DATAB": validFrom,
                                        "MM_VOLUME_MARM_VOLUM": basicData.Volum || null,
                                        "MM_VOLUME_UNIT_MARM_VOLEH": basicData.Volumeunit || null,
                                        "MM_WEIGHT_UNIT_MARM_GEWEI": basicData.UnitOfWt || null,
                                        "MM_X_PLANT_MATERIAL_STATUS_MARA_MSTAE": purStatusVal || null
                                    }
                                    oldBasicData2 = {
                                        "MM_BASIC_MATERIAL_MARA_WRKST": basicData.BasicMatl || null,
                                        "MM_CAD_INDICATOR_MARA_CADKZ": basicData.CadId || false,
                                        "MM_CROSS_PLANT_CM_MARA_SATNR": basicData.crossPlantCm || null,
                                        "MM_DG_INDICATOR_PROFILE_MARA_PROFL": basicData.Hazmatprof || null,
                                        "MM_DOC_CH_NO_MARA_AESZN": basicData.DocChgNo || null,
                                        "MM_DOCUMENT_VERSION_MARA_ZEIVR": basicData.DocVers || null,
                                        "MM_DOCUMENT_MARA_ZEINR": basicData.Document || null,
                                        "MM_DOCUMENT_TYPE_MARA_ZEIAR": basicData.DocType || null,
                                        "MM_IN_BULK_LIQUID_MARA_ILOOS": basicData.Looseorliq || false,
                                        "MM_ENVIRONMENTALLY_RELEVANT_MARA_KZUMW": basicData.EnvtRlvt || false,
                                        "MM_HIGHLY_VISCOS_MARA_IHIVI": basicData.HighVisc || false,
                                        "MM_IND_DESCRIPTION_MARA_NORMT": basicData.StdDescr || null,
                                        "MM_MATERIAL_IS_CONFIGURABLE_MARA_KZKFG": basicData.matIsConfigurable || false,
                                        "materialListId": null,
                                        "MM_MEDIUM_MARA_MEDIUM": basicData.Medium || null,
                                        "MM_NO_LINK": basicData.noLink || false,
                                        "MM_NO_SHEETS_MARA_BLANZ": basicData.NoSheets || null,
                                        "MM_PAGE_FORMAT_OF_DOCUMENT_MARA_ZEIFO": basicData.DocFormat || null,
                                        "MM_PAGE_FORMAT_OF_PRODUCTION_MEMO_MARA_FORMT": basicData.Pageformat || null,
                                        "MM_PAGE_NUMBER_MARA_BLATT": basicData.PageNo || null,
                                        "MM_PRODUCTION_INSPECTION_MEMO_MARA_FERTH": basicData.ProdMemo || null,
                                        "MM_VARIANT": basicData.GtinVariant || false,
                                    }

                                    MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/basicData1Dto`, oldBasicData1);
                                    MaterialDetails.setProperty(`/GeneralData/oldMaterialDetailsData/targetSystem/${currentSystemId}/basicData2Dto`, oldBasicData2);
                                } catch (e) { }
                            }
                        }
                    }
                })
            },

            onLoadingBaseUomData: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    listOfAllBaseUoms = LookupModel.getProperty("/MM_UOM_REF_LIST"),
                    that = this;
                if (!listOfAllBaseUoms) {
                    let conditions = [
                        {
                            "VIATRIS_MM_CONDITIONS.MM_SERIAL_NO": null
                        }
                    ],
                        systemOrders = {
                            "MM_UOM_REF_LIST.MM_UOM_REF_LIST_DESC": "ASC"
                        },
                        systemFilters = [
                            {
                                "column": "MM_UOM_REF_LIST.MM_ACTIVE",
                                "operator": "like",
                                "value": "%Yes%"
                            }
                        ];
                    let payload = that.onGetRulePayload("MM_UOM_REF_LIST", conditions, systemOrders, systemFilters);
                    that.fnProcessDataRequest("MM_WORKRULE/rest/v1/invoke-rules", "POST", null, false, payload,
                        function (responseData) {
                            listOfAllBaseUoms = responseData?.data?.result[0]?.MM_UOM_REF_LIST;
                            LookupModel.setProperty("/MM_UOM_REF_LIST", listOfAllBaseUoms);
                        },
                        function (error) { }
                    );
                }
            },

            fnToGetBaseUomListKeyCodePair: function () {
                var lookupModel = this.getModelDetails("LookupModel"),
                    listOfBaseUoms = lookupModel.getProperty("/MM_UOM_REF_LIST"),
                    mappedBaseUom;
                mappedBaseUom = listOfBaseUoms?.map(item => ({
                    baseUomCode: item?.MM_UOM_REF_LIST_CODE,
                    baseUomKey: item?.MM_KEY
                }));
                return mappedBaseUom || null;
            },

            fnToGetMaterialTypeKeyCodePair: function () {
                var lookupModel = this.getModelDetails("LookupModel"),
                    listOfMaterialTypes = lookupModel.getProperty("/materialType"),
                    mappedMatType;
                mappedMatType = listOfMaterialTypes?.map(item => ({
                    matTypeCode: item?.MM_MATERIAL_TYPE_SAP_CODE,
                    matTypeKey: item?.MM_KEY
                }));
                return mappedMatType || null;
            },

            fnToGetSystemKeyCodePair: function () {
                var lookupModel = this.getModelDetails("LookupModel"),
                    listOfSystems = lookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    mappedSystem;
                mappedSystem = listOfSystems?.map(item => ({
                    systemDesc: item?.MM_SYSTEM_REF_LIST_CODE,
                    systemKey: item?.MM_KEY
                }));
                return mappedSystem || null;
            },

            onLoadingCountrySetData: function () {
                var LookupModel = this.getModelDetails("LookupModel"),
                    countryList = LookupModel.getProperty("/CountryCode");
                if (!countryList) {
                    let that = this,
                        sEntityName = "/CountryCodeSet";
                    that.fnGetOdataService("ZapiMaterialOModel", sEntityName, "", "").then(function (responseData) {
                        if (responseData?.results?.length) {
                            LookupModel.setProperty("/CountryCode", responseData.results);
                        }
                    });
                }
            },
            handleSystemDropdown: function (selectedSystem) {
                let MaterialDetails = this.getModelDetails("MaterialDetails"),
                    LookupModel = this.getModelDetails("LookupModel"),
                    selectedSystems = MaterialDetails.getProperty("/SystemData/selectedSystems"),
                    listOfAllSystems = LookupModel.getProperty("/MM_SYSTEM_REF_LIST"),
                    listOfSystems = [];
                // CreateProject = this.getModelDetails("CreateProject");

                for (let system of selectedSystems) {
                    let index = listOfAllSystems.findIndex(eachSystem => eachSystem.MM_KEY == system.MM_SYSTEM_ID);
                    if (index != -1) {
                        listOfSystems.push(listOfAllSystems[index]);
                    }
                }
                MaterialDetails.setProperty("/SystemData/listOfSystems", listOfSystems);
                MaterialDetails.setProperty("/SystemData/targetSystem", selectedSystem);
            },

            onOkWfTriggeredInfo: function () {
                this.getView().byId("id_WfTriggeredInfo").close();
                let oAppModel = this.getModelDetails("oAppModel"),
                    requestType = this.fnGetRequestHeaderData("requestType"),
                    wfTaskType = oAppModel.getProperty("/taskDetails/wfTaskType");
                if (requestType == 6 || (requestType == 1 && wfTaskType != "Request_Form_Submission")) {
                    this.fnDirectPlantSync();
                }
                else {
                    this.navigateTo("RequestManagement");
                }
            },

            onCloseDialogSAPError: function () {
                this.byId("idSAPerror").close();
            },

            fnMakeSystemDetailsNonEditable: async function (system) {
                let that = this,
                    MaterialDetails = this.getModelDetails("MaterialDetails"),
                    MaterialDetailsLocation = await jQuery.sap.getModulePath("com.viatris.materialmaster", "/localData/MaterialDetails.json"),
                    MaterialDetailsLocalModel = new JSONModel();

                that.getView().setModel(MaterialDetailsLocalModel, "MaterialDetailsLocalModel");
                await MaterialDetailsLocalModel.loadData(MaterialDetailsLocation);

                let MaterialDetailsLocalModelData = MaterialDetailsLocalModel.getData(),
                    basicData1Template = MaterialDetailsLocalModelData?.SystemDetails?.basicData1,
                    basicData2Template = MaterialDetailsLocalModelData?.SystemDetails?.basicData2,
                    descriptionDataTemplate = MaterialDetailsLocalModelData?.SystemDetails?.AdditionalData.descriptionData,
                    basicDataTextTemplate = MaterialDetailsLocalModelData?.SystemDetails?.AdditionalData.basicDataText;

                //Basic Data 1 Editable false
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/generalData/editable`, basicData1Template?.generalData?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/matAuthGroup/editable`, basicData1Template?.matAuthGroup?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/dimensionsEans/editable`, basicData1Template?.dimensionsEans?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/packagingMatData/editable`, basicData1Template?.packagingMatData?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData1/advTrackTrace/editable`, basicData1Template?.advTrackTrace?.editable);

                //Basic Data 2 Editable false
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/otherData/editable`, basicData2Template?.otherData?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/environment/editable`, basicData2Template?.environment?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designDocAssigned/editable`, basicData2Template?.designDocAssigned?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/designdrawing/editable`, basicData2Template?.designdrawing?.editable);
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/basicData2/clientSpecificConfig/editable`, basicData2Template?.clientSpecificConfig?.editable);

                //Additional Data Description editable false
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/descriptionData/descAddBtnEnabled`, descriptionDataTemplate?.descAddBtnEnabled);

                //Additional Data Basic Data text editable false
                MaterialDetails.setProperty(`/AggregatedSystemDetails/${system}/AdditionalData/basicDataText/basicTextAddBtnEnabled`, basicDataTextTemplate?.basicTextAddBtnEnabled);
            },

            fnToDisableUiTableSelectedRow: function (oTable, currentSelectedIndex) {
                let aRows = oTable?.getRows(),
                    clickToSelect = this.geti18nText("clickToSelect");
                aRows?.map(aRow => {
                    aRow?.removeStyleClass("disabledRow");
                    let aCells = aRow?.getCells();
                    aCells?.map(aCell => {
                        aCell?.setTooltip(clickToSelect);
                    })
                })
                if (aRows[currentSelectedIndex]) {
                    aRows[currentSelectedIndex]?.addStyleClass("disabledRow");
                    let aCells = aRows[currentSelectedIndex]?.getCells();
                    aCells?.map(aCell => {
                        aCell?.setTooltip(" ");
                    })
                }
            }
        });
    });