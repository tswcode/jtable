/************************************************************************
* FORMS extension for jTable (base for edit/create forms)               *
*************************************************************************/
(function ($) {

    $.extend(true, $.hik.jtable.prototype, {

        /************************************************************************
        * PRIVATE METHODS                                                       *
        *************************************************************************/

        /* Submits a form asynchronously using AJAX.
        *  This method is needed, since form submitting logic can be overrided
        *  by extensions.
        *************************************************************************/
        _submitFormUsingAjax: function (url, formData, success, error) {
            this._ajax({
                url: url,
                data: formData,
                success: success,
                error: error
            });
        },

        /* Creates label for an input element.
        *************************************************************************/
        _createInputLabelForRecordField: function (fieldName) {
        	if(this.options.bootstrap3) {
		      	var $l = $('<label />')
                        .attr('for','Edit-'+fieldName)
                        .addClass("control-label col-lg-4")
                        .html(this.options.fields[fieldName].inputTitle || this.options.fields[fieldName].title);
              
            if(this.options.fields[fieldName].bs3LabelClass !== '' && typeof(this.options.fields[fieldName].bs3LabelClass) !== 'undefined'){
            	$l.addClass(this.options.fields[fieldName].bs3LabelClass);
            }
              
            return $l;
          }else{
            //TODO: May create label tag instead of a div.
            return $('<div />')
                .addClass('jtable-input-label')
                .html(this.options.fields[fieldName].inputTitle || this.options.fields[fieldName].title);
          }
        },

        /* Creates an input element according to field type.
        *************************************************************************/
        _createInputForRecordField: function (funcParams) {
            var self = this;
            
            var fieldName = funcParams.fieldName,
                value = funcParams.value,
                record = funcParams.record,
                formType = funcParams.formType,
                form = funcParams.form;

            //Get the field
            var field = self.options.fields[fieldName];

            //If value if not supplied, use defaultValue of the field
            if (typeof value === undefined || value === null) {
                value = field.defaultValue;
            }

            //Use custom function if supplied
            if (field.input) {
                var $input = $(field.input({
                    value: value,
                    record: record,
                    formType: formType,
                    form: form
                }));

                //Add id attribute if does not exists
                if (!$input.attr('id')) {
                    $input.attr('id', 'Edit-' + fieldName);
                }

                //Wrap input element with div
                var $iDiv = $('<div />')
                    .addClass('jtable-input jtable-custom-input')
                    .append($input);
                
                if(self.options.bs3UseFormGroup){
                	$iDiv.addClass('form-group');
                }
                
                return $iDiv;
            }

            //Create input according to field type
            var $f = null;
            if (field.type === 'date') {
                $f = self._createDateInputForField(field, fieldName, value);
            } else if (field.type === 'textarea') {
                $f = self._createTextAreaForField(field, fieldName, value);
            } else if (field.type === 'password') {
                $f = self._createPasswordInputForField(field, fieldName, value);
            } else if (field.type === 'checkbox') {
                $f = self._createCheckboxForField(field, fieldName, value);
            } else if (field.options) {
                if (field.type === 'radiobutton') {
                    $f = self._createRadioButtonListForField(field, fieldName, value, record, formType);
                } else {
                    $f = self._createDropDownListForField(field, fieldName, value, record, formType, form);
                }
            } else {
                $f = self._createTextInputForField(field, fieldName, value);
            }
            
            if(this.options.bootstrap3){
            	if(self.options.fields[fieldName].bs3InputColClass !== '' && typeof(self.options.fields[fieldName].bs3InputColClass) !== 'undefined'){
            		return $('<div />').addClass(self.options.fields[fieldName].bs3InputColClass).append($f.find('input'));
            	}else{
            		return $f.addClass("col-lg-8");
            	}
            }else{
            	return $f;
          	}
        },

        //Creates a hidden input element with given name and value.
        _createInputForHidden: function (fieldName, value) {
            if (typeof value === "undefined") {
                value = "";
            }

            return $('<input type="hidden" name="' + fieldName + '" id="Edit-' + fieldName + '"></input>')
                .val(value);
        },

        /* Creates a date input for a field.
        *************************************************************************/
        _createDateInputForField: function (field, fieldName, value) {
            var self = this;
            
            var $input = $('<input id="Edit-' + fieldName + '" type="text" name="' + fieldName + '"></input>');
            if (typeof field.inputClass !== "undefined") {
                 $input.addClass(field.inputClass);
            }
            if (typeof value !== "undefined") {
                $input.val(value);
            }
            
            var displayFormat = field.displayFormat || self.options.defaultDateFormat;
            
            //Add DatePicker
            if(self.options.bootstrap3){
                $input.addClass("form-control");
                if(self.options.useMobiScroll) {
                    $input.scroller({
                      preset: field.msPreset || self.options.msPreset,
                      minDate: field.msMinDate || self.options.msMinDate,
                      maxDate: field.msMaxDate || self.options.msMaxDate,
                      stepMinute: field.msMaxDate || self.options.msStepMinute,
                      theme: field.msTheme || self.options.msTheme,
                      mode: field.msMode || self.options.msMode,
                      display: field.msDisplay || self.options.msDisplay,
                      lang: field.msLang || self.options.msLang
                    });
                } else {
                    $input.addClass('datepicker'); //.css('z-index','2000').css('position','relative');
                    $input.datepicker({ 
                        format: displayFormat,
                        weekStart:self.options.bs3DPweekStart,
                        calendarWeeks:self.options.bs3DPcalendarWeeks,
                        startDate:self.options.bs3DPstartDate,
                        endDate:self.options.bs3DPendDate,
                        daysOfWeekDisabled:self.options.bs3DPdaysOfWeekDisabled,
                        autoclose:self.options.bs3DPautoclose,
                        startView:self.options.bs3DPstartView,
                        minViewMode:self.options.bs3DPminViewMode,
                        todayBtn:self.options.bs3DPtodayBtn,
                        todayHighlight: self.options.bs3DPtodayHighlight,
                        clearBtn: self.options.bs3DPclearBtn,
                        keyboardNavigation: self.options.bs3DPkeyboardNavigation,
                        language:self.options.bs3DPlanguage,
                        forceParse:self.options.bs3DPforceParse,
                        inputs:self.options.bs3DPinputs,
                        beforeShowDay:self.options.bs3DPbeforeShowDay,
                        orientation:self.options.bs3DPorientation
                    });
                }
            }else{
            	$input.datepicker({ dateFormat: displayFormat });
          	}
          	
            return $('<div />')
                .addClass('jtable-input jtable-date-input')
                .append($input);
        },

        /* Creates a textarea element for a field.
        *************************************************************************/
        _createTextAreaForField: function (field, fieldName, value) {
            var self = this;
            
            var $textArea = $('<textarea id="Edit-' + fieldName + '" name="' + fieldName + '"></textarea>');
            if (typeof field.inputClass !== "undefined") {
                $textArea.addClass(field.inputClass);
            }
            if (typeof value !== "undefined") {
                $textArea.val(value);
            }
            
            if(self.options.bootstrap3) {
                $textArea.addClass("form-control");
            }
            
            return $('<div />')
                .addClass('jtable-input jtable-textarea-input')
                .append($textArea);
        },

        /* Creates a standart textbox for a field.
        *************************************************************************/
        _createTextInputForField: function (field, fieldName, value) {
            var self = this;
            var $input = $('<input id="Edit-' + fieldName + '" type="text" name="' + fieldName + '"></input>');
            
            if(typeof field.inputClass !== "undefined") {
                $input.addClass(field.inputClass);
            }
            if(self.options.bootstrap3){
                $input.addClass("form-control");
            }
            if (typeof value !== "undefined") {
                $input.val(value);
            }
            
          	var $iDiv = $('<div />')
                .addClass('jtable-input jtable-text-input')
                .append($input);
            
            return $iDiv;
        },

        /* Creates a password input for a field.
        *************************************************************************/
        _createPasswordInputForField: function (field, fieldName, value) {
            var self = this;
            var $input = $('<input id="Edit-' + fieldName + '" type="password" name="' + fieldName + '"></input>');
            
            if(typeof field.inputClass !== "undefined") {
                $input.addClass(field.inputClass);
            }
            if(self.options.bootstrap3){
                $input.addClass("form-control");
            }
            if (typeof value !== "undefined") {
                $input.val(value);
            }
            
            return $('<div />')
                .addClass('jtable-input jtable-password-input')
                .append($input);
        },

        /* Creates a checkboxfor a field.
        *************************************************************************/
        _createCheckboxForField: function (field, fieldName, value) {
            var self = this;
            
            //If value is undefined, get unchecked state's value
            if (typeof value === "undefined") {
                value = self._getCheckBoxPropertiesForFieldByState(fieldName, false).Value;
            }

            //Create a container div
            var $containerDiv = $('<div />')
                .addClass('jtable-input jtable-checkbox-input');

            if(self.options.bootstrap3) {
                var $checkBoxDiv = $('<div class="checkbox" />').appendTo($containerDiv);
            }

            //Create checkbox and check if needed
            var $checkBox = $('<input id="Edit-' + fieldName + '" type="checkbox" name="' + fieldName + '" />');
            
            if(self.options.bootstrap3) {
                $checkBox.appendTo($checkBoxDiv);
            } else {
                $checkBox.appendTo($containerDiv);
            }
            
            if(typeof field.inputClass !== "undefined") {
                $checkBox.addClass(field.inputClass);
            }
            if (typeof value !== "undefined") {
                $checkBox.val(value);
            }

            //Create display text of checkbox for current state
            var $textSpan = $('<span>' + (field.formText || self._getCheckBoxTextForFieldByValue(fieldName, value)) + '</span>');
        
            if(self.options.bootstrap3) {
                $textSpan.appendTo($checkBoxDiv);
            } else {
                $textSpan.appendTo($containerDiv);
            }

            //Check the checkbox if it's value is checked-value
            if (self._getIsCheckBoxSelectedForFieldByValue(fieldName, value)) {
                $checkBox.attr('checked', 'checked');
            }

            //This method sets checkbox's value and text according to state of the checkbox
            var refreshCheckBoxValueAndText = function () {
                var checkboxProps = self._getCheckBoxPropertiesForFieldByState(fieldName, $checkBox.is(':checked'));
                $checkBox.attr('value', checkboxProps.Value);
                $textSpan.html(field.formText || checkboxProps.DisplayText);
            };

            //Register to click event to change display text when state of checkbox is changed.
            $checkBox.click(function () {
                refreshCheckBoxValueAndText();
            });

            //Change checkbox state when clicked to text
            if (field.setOnTextClick !== false) {
                $textSpan
                    .addClass('jtable-option-text-clickable')
                    .click(function () {
                        if ($checkBox.is(':checked')) {
                            $checkBox.attr('checked', false);
                        } else {
                            $checkBox.attr('checked', true);
                        }

                        refreshCheckBoxValueAndText();
                    });
            }

            return $containerDiv;
        },

        /* Creates a drop down list (combobox) input element for a field.
        *************************************************************************/
        _createDropDownListForField: function (field, fieldName, value, record, source, form) {

            //Create a container div
            var $containerDiv = $('<div />')
                .addClass('jtable-input jtable-dropdown-input');

            //Create select element
            var $select = $('<select class="' + field.inputClass + '" id="Edit-' + fieldName + '" name="' + fieldName + '"></select>')
                .appendTo($containerDiv);

            //add options
            var options = this._getOptionsForField(fieldName, {
                record: record,
                source: source,
                form: form,
                dependedValues: this._createDependedValuesUsingForm(form, field.dependsOn)
            });

            this._fillDropDownListWithOptions($select, options, value);

            return $containerDiv;
        },
        
        /* Fills a dropdown list with given options.
        *************************************************************************/
        _fillDropDownListWithOptions: function ($select, options, value) {
            $select.empty();
            for (var i = 0; i < options.length; i++) {
                $('<option' + (options[i].Value === value ? ' selected="selected"' : '') + '>' + options[i].DisplayText + '</option>')
                    .val(options[i].Value)
                    .appendTo($select);
            }
        },

        /* Creates depended values object from given form.
        *************************************************************************/
        _createDependedValuesUsingForm: function ($form, dependsOn) {
            if (!dependsOn) {
                return {};
            }

            var dependedValues = {};

            for (var i = 0; i < dependsOn.length; i++) {
                var dependedField = dependsOn[i];

                var $dependsOn = $form.find('select[name=' + dependedField + ']');
                if ($dependsOn.length <= 0) {
                    continue;
                }

                dependedValues[dependedField] = $dependsOn.val();
            }


            return dependedValues;
        },

        /* Creates a radio button list for a field.
        *************************************************************************/
        _createRadioButtonListForField: function (field, fieldName, value, record, source) {
            var self = this;
            var $containerDiv = $('<div />')
                .addClass('jtable-input jtable-radiobuttonlist-input');

            var options = self._getOptionsForField(fieldName, {
                record: record,
                source: source
            });

            $.each(options, function(i, option) {
                var $radioButtonDiv = $('<div class=""></div>')
                    .addClass('jtable-radio-input')
                    .appendTo($containerDiv);
            
                if(self.options.bootstrap3) {
                   var $radioContainerDiv = $('<div class="radio" />').appendTo($radioButtonDiv);
                }

                var $radioButton = $('<input type="radio" id="Edit-' + fieldName + '-' + i + '" cname="' + fieldName + '"' + ((option.Value === (value + '')) ? ' checked="true"' : '') + ' />')
                    .val(option.Value);
                
                if(self.options.bootstrap3) {
                    $radioButton.appendTo($radioContainerDiv);
                } else {
                    $radioButton.appendTo($radioButtonDiv);
                }
            
                if(typeof field.inputClass !== "undefined") {
                    $radioButton.addClass(field.inputClass);
                }

                var $textSpan = $('<span></span>').html(option.DisplayText);
                if(self.options.bootstrap3) {
                    $textSpan.appendTo($radioContainerDiv);
                } else {
                    $textSpan.appendTo($radioButtonDiv);
                }

                if (field.setOnTextClick !== false) {
                    $textSpan
                        .addClass('jtable-option-text-clickable')
                        .click(function () {
                            if (!$radioButton.is(':checked')) {
                                $radioButton.attr('checked', true);
                            }
                        });
                }
            });

            return $containerDiv;
        },

        /* Gets display text for a checkbox field.
        *************************************************************************/
        _getCheckBoxTextForFieldByValue: function (fieldName, value) {
            return this.options.fields[fieldName].values[value];
        },

        /* Returns true if given field's value must be checked state.
        *************************************************************************/
        _getIsCheckBoxSelectedForFieldByValue: function (fieldName, value) {
            return (this._createCheckBoxStateArrayForFieldWithCaching(fieldName)[1].Value.toString() === value.toString());
        },

        /* Gets an object for a checkbox field that has Value and DisplayText
        *  properties.
        *************************************************************************/
        _getCheckBoxPropertiesForFieldByState: function (fieldName, checked) {
            return this._createCheckBoxStateArrayForFieldWithCaching(fieldName)[(checked ? 1 : 0)];
        },

        /* Calls _createCheckBoxStateArrayForField with caching.
        *************************************************************************/
        _createCheckBoxStateArrayForFieldWithCaching: function (fieldName) {
            var cacheKey = 'checkbox_' + fieldName;
            if (!this._cache[cacheKey]) {

                this._cache[cacheKey] = this._createCheckBoxStateArrayForField(fieldName);
            }

            return this._cache[cacheKey];
        },

        /* Creates a two element array of objects for states of a checkbox field.
        *  First element for unchecked state, second for checked state.
        *  Each object has two properties: Value and DisplayText
        *************************************************************************/
        _createCheckBoxStateArrayForField: function (fieldName) {
            var stateArray = [];
            var currentIndex = 0;
            $.each(this.options.fields[fieldName].values, function (propName, propValue) {
                if (currentIndex++ < 2) {
                    stateArray.push({ 'Value': propName, 'DisplayText': propValue });
                }
            });

            return stateArray;
        },

        /* Searches a form for dependend dropdowns and makes them cascaded.
        */
        _makeCascadeDropDowns: function ($form, record, source) {
            var self = this;

            $form.find('select') //for each combobox
                .each(function () {
                    var $thisDropdown = $(this);

                    //get field name
                    var fieldName = $thisDropdown.attr('name');
                    if (!fieldName) {
                        return;
                    }

                    var field = self.options.fields[fieldName];
                    
                    //check if this combobox depends on others
                    if (!field.dependsOn) {
                        return;
                    }

                    //for each dependency
                    $.each(field.dependsOn, function (index, dependsOnField) {
                        //find the depended combobox
                        var $dependsOnDropdown = $form.find('select[name=' + dependsOnField + ']');
                        //when depended combobox changes
                        $dependsOnDropdown.change(function () {

                            //Refresh options
                            var funcParams = {
                                record: record,
                                source: source,
                                form: $form,
                                dependedValues: {}
                            };
                            funcParams.dependedValues = self._createDependedValuesUsingForm($form, field.dependsOn);
                            var options = self._getOptionsForField(fieldName, funcParams);

                            //Fill combobox with new options
                            self._fillDropDownListWithOptions($thisDropdown, options, undefined);

                            //Thigger change event to refresh multi cascade dropdowns.
                            $thisDropdown.change();
                        });
                    });
                });
        },

        /* Updates values of a record from given form
        *************************************************************************/
        _updateRecordValuesFromForm: function (record, $form) {
            for (var i = 0; i < this._fieldList.length; i++) {
                var fieldName = this._fieldList[i];
                var field = this.options.fields[fieldName];

                //Do not update non-editable fields
                if (field.edit === false) {
                    continue;
                }

                //Get field name and the input element of this field in the form
                var $inputElement = $form.find('[name="' + fieldName + '"]');
                if ($inputElement.length <= 0) {
                    continue;
                }

                //Update field in record according to it's type
                if (field.type === 'date') {
                    var dateVal = $inputElement.val();
                    if (dateVal) {
                        var displayFormat = field.displayFormat || this.options.defaultDateFormat;
                        try {
                            var date = $.mobiscroll.formatDate(displayFormat, dateVal);
                            record[fieldName] = '/Date(' + date.getTime() + ')/';
                        } catch (e) {
                            //TODO: Handle incorrect/different date formats
                            this._logWarn('Date format is incorrect for field ' + fieldName + ': ' + dateVal);
                            record[fieldName] = undefined;
                        }
                    } else {
                        this._logDebug('Date is empty for ' + fieldName);
                        record[fieldName] = undefined; //TODO: undefined, null or empty string?
                    }
                } else if (field.options && field.type === 'radiobutton') {
                    var $checkedElement = $inputElement.filter(':checked');
                    if ($checkedElement.length) {
                        record[fieldName] = $checkedElement.val();
                    } else {
                        record[fieldName] = undefined;
                    }
                } else {
                    record[fieldName] = $inputElement.val();
                }
            }
        },

        /* Sets enabled/disabled state of a dialog button.
        *************************************************************************/
        _setEnabledOfDialogButton: function ($button, enabled, buttonText) {
            if (!$button) {
                return;
            }

            if (enabled !== false) {
                $button
                    .removeAttr('disabled')
                    .removeClass('ui-state-disabled');
            } else {
                $button
                    .attr('disabled', 'disabled')
                    .addClass('ui-state-disabled');
            }

            if (buttonText) {
            	if ($button.has('span').length) {
                $button.find('span').text(buttonText);
              }else{
              	$button.text(buttonText);
              }
            }
        }

    });

})(jQuery);
