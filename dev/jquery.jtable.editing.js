/************************************************************************
* EDIT RECORD extension for jTable                                      *
*************************************************************************/
(function ($) {

    //Reference to base object members
    var base = {
        _create: $.hik.jtable.prototype._create,
        _addColumnsToHeaderRow: $.hik.jtable.prototype._addColumnsToHeaderRow,
        _addCellsToRowUsingRecord: $.hik.jtable.prototype._addCellsToRowUsingRecord
    };

    //extension members
    $.extend(true, $.hik.jtable.prototype, {

        /************************************************************************
        * DEFAULT OPTIONS / EVENTS                                              *
        *************************************************************************/
        options: {

            //Events
            recordUpdated: function (event, data) { },
            rowUpdated: function (event, data) { },

            //Localization
            messages: {
                editRecord: 'Edit Record'
            }
        },

        /************************************************************************
        * PRIVATE FIELDS                                                        *
        *************************************************************************/

        _$editDiv: null, //Reference to the editing dialog div (jQuery object)
        _$editingRow: null, //Reference to currently editing row (jQuery object)

        /************************************************************************
        * CONSTRUCTOR AND INITIALIZATION METHODS                                *
        *************************************************************************/

        /* Overrides base method to do editing-specific constructions.
        *************************************************************************/
        _create: function () {
            base._create.apply(this, arguments);
            this._createEditDialogDiv();
        },

        /* Creates and prepares edit dialog div
        *************************************************************************/
        _createEditDialogDiv: function () {
            var self = this;

            //Create a div for dialog and add to container element
            self._$editDiv = $('<div></div>')
                .appendTo(self._$mainContainer);
                
            if(self.options.bootstrap3){
            	/*TODO: Update to Edit Form attributes*/
            	
            	var rndID = 'createModal' + Math.floor((Math.random()*10000)+1);
            	var arBtn = $('<button id="EditRecordDialogSaveButton" type="button" class="btn btn-primary">' + self.options.messages.save + '</button>');
            	//Bootstrap Modal
            	self._$editDiv.addClass('modal fade').attr('id',rndID).attr('role','dialog').attr('tabindex','-1').attr('aria-hidden','true').attr('aria-labelledby',rndID+'Title');
            	$('<div />').addClass('modal-dialog')
            	.append(
            		$('<div />').addClass('modal-content').append(
            			$('<div />').addClass('modal-header').append(
            				'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
            				'<h4 class="modal-title" id="'+rndID+'Title">' + self.options.messages.editRecord + '</h4>'
            			)
            		).append(
            			$('<div />').addClass('modal-body').append(self._$editDiv.find('form:first'))
            		).append(
            			$('<div />').addClass('modal-footer').append(
            				'<button type="button" class="btn btn-default" data-dismiss="modal">' + self.options.messages.cancel + '</button>'
            				//+
        						//'<button id="AddRecordDialogSaveButton" type="button" class="btn btn-primary">' + self.options.messages.save + '</button>'
            			).append(arBtn)
            		)
            	)
            	.appendTo(self._$editDiv);
            	
            	self._$editDiv.on('hidden.bs.modal', function () {
                    var $addRecordForm = self._$addRecordDiv.find('form').first();
                    var $saveButton = $('#EditRecordDialogSaveButton');
                    self._trigger("formClosed", null, { form: $addRecordForm, formType: 'create' });
                    self._setEnabledOfDialogButton($saveButton, true, self.options.messages.save);
                    $addRecordForm.remove();
                });

                arBtn.on('click',function(){
                    //var $saveButton = $('#AddRecordDialogSaveButton');
                    var $addRecordForm = self._$editDiv.find('form');
                    if (self._trigger("formSubmitting", null, { form: $addRecordForm, formType: 'create' }) !== false) {
                      self._setEnabledOfDialogButton(arBtn, false, self.options.messages.saving);
                      self._saveAddRecordForm($addRecordForm, arBtn);
                    }
                });
            }else{
							//jQuery UI Dialog
	            //Prepare dialog
	            self._$editDiv.dialog({
	                autoOpen: false,
	                show: self.options.dialogShowEffect,
	                hide: self.options.dialogHideEffect,
	                width: 'auto',
	                minWidth: '300',
	                modal: true,
	                title: self.options.messages.editRecord,
	                buttons:
	                        [{  //cancel button
	                            text: self.options.messages.cancel,
	                            click: function () {
	                                self._$editDiv.dialog('close');
	                            }
	                        }, { //save button
	                            id: 'EditDialogSaveButton',
	                            text: self.options.messages.save,
	                            click: function () {
	                                
	                                //row maybe removed by another source, if so, do nothing
	                                if (self._$editingRow.hasClass('jtable-row-removed')) {
	                                    self._$editDiv.dialog('close');
	                                    return;
	                                }
	
	                                var $saveButton = self._$editDiv.find('#EditDialogSaveButton');
	                                var $editForm = self._$editDiv.find('form');
	                                if (self._trigger("formSubmitting", null, { form: $editForm, formType: 'edit', row: self._$editingRow }) !== false) {
	                                    self._setEnabledOfDialogButton($saveButton, false, self.options.messages.saving);
	                                    self._saveEditForm($editForm, $saveButton);
	                                }
	                            }
	                        }],
	                close: function () {
	                    var $editForm = self._$editDiv.find('form:first');
	                    var $saveButton = $('#EditDialogSaveButton');
	                    self._trigger("formClosed", null, { form: $editForm, formType: 'edit', row: self._$editingRow });
	                    self._setEnabledOfDialogButton($saveButton, true, self.options.messages.save);
	                    $editForm.remove();
	                }
	            });
          	}
        },

        /************************************************************************
        * PUNLIC METHODS                                                        *
        *************************************************************************/

        /* Updates a record on the table (optionally on the server also)
        *************************************************************************/
        updateRecord: function (options) {
            var self = this;
            options = $.extend({
                clientOnly: false,
                animationsEnabled: self.options.animationsEnabled,
                url: self.options.actions.updateAction,
                success: function () { },
                error: function () { }
            }, options);

            if (!options.record) {
                self._logWarn('options parameter in updateRecord method must contain a record property.');
                return;
            }

            var key = self._getKeyValueOfRecord(options.record);
            if (typeof key === "undefined" || key === null) {
                self._logWarn('options parameter in updateRecord method must contain a record that contains the key field property.');
                return;
            }

            var $updatingRow = self.getRowByKey(key);
            if ($updatingRow === null) {
                self._logWarn('Can not found any row by key: ' + key);
                return;
            }

            if (options.clientOnly) {
                $.extend($updatingRow.data('record'), options.record);
                self._updateRowTexts($updatingRow);
                self._onRecordUpdated($updatingRow, null);
                if (options.animationsEnabled) {
                    self._showUpdateAnimationForRow($updatingRow);
                }

                options.success();
                return;
            }

            self._submitFormUsingAjax(
                options.url,
                $.param(options.record),
                function (data) {
                    if (data.Result !== 'OK') {
                        self._showError(data.Message);
                        options.error(data);
                        return;
                    }

                    $.extend($updatingRow.data('record'), options.record);
                    self._updateRecordValuesFromServerResponse($updatingRow.data('record'), data);

                    self._updateRowTexts($updatingRow);
                    self._onRecordUpdated($updatingRow, data);
                    if (options.animationsEnabled) {
                        self._showUpdateAnimationForRow($updatingRow);
                    }

                    options.success(data);
                },
                function () {
                    self._showError(self.options.messages.serverCommunicationError);
                    options.error();
                });
        },

        /************************************************************************
        * OVERRIDED METHODS                                                     *
        *************************************************************************/

        /* Overrides base method to add a 'editing column cell' to header row.
        *************************************************************************/
        _addColumnsToHeaderRow: function ($tr) {
            base._addColumnsToHeaderRow.apply(this, arguments);
            if (this.options.actions.updateAction !== undefined) {
                $tr.append(this._createEmptyCommandHeader());
            }
        },

        /* Overrides base method to add a 'edit command cell' to a row.
        *************************************************************************/
        _addCellsToRowUsingRecord: function ($row) {
            var self = this;
            base._addCellsToRowUsingRecord.apply(this, arguments);

            if (self.options.actions.updateAction !== undefined) {
                var $span = $('<span></span>');
                if(self.options.bootstrap3){
                    $span.addClass("glyphicon glyphicon-pencil");
                } else {
                    $span.html(self.options.messages.editRecord);
                }
                var $button = $('<button title="' + self.options.messages.editRecord + '"></button>')
                    .addClass('jtable-command-button jtable-edit-command-button')
                    .append($span)
                    .click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self._showEditForm($row);
                });
                if(self.options.bootstrap3){
                    $button.addClass("btn btn-primary");
                }
                $('<td></td>')
                    .addClass('jtable-command-column')
                    .append($button)
                    .appendTo($row);
            }
        },

        /************************************************************************
        * PRIVATE METHODS                                                       *
        *************************************************************************/

        /* Shows edit form for a row.
        *************************************************************************/
        _showEditForm: function ($tableRow) {
            var self = this;
            var record = $tableRow.data('record');

            //Create edit form
            var $editForm = $('<form id="jtable-edit-form" class="jtable-dialog-form jtable-edit-form" action="' + self.options.actions.updateAction + '" method="POST"></form>');

            if(self.options.bootstrap3){
                $editForm.addClass("form-horizontal");
            }

            //Create input fields
            for (var i = 0; i < self._fieldList.length; i++) {

                var fieldName = self._fieldList[i];
                var field = self.options.fields[fieldName];
                var fieldValue = record[fieldName];

                if (field.key === true) {
                    if (field.edit !== true) {
                        //Create hidden field for key
                        $editForm.append(self._createInputForHidden(fieldName, fieldValue));
                        continue;
                    } else {
                        //Create a special hidden field for key (since key is be editable)
                        $editForm.append(self._createInputForHidden('jtRecordKey', fieldValue));
                    }
                }

                //Do not create element for non-editable fields
                if (field.edit === false) {
                    continue;
                }

                //Hidden field
                if (field.type === 'hidden') {
                    $editForm.append(self._createInputForHidden(fieldName, fieldValue));
                    continue;
                }

                //Create a container div for this input field and add to form
                var $fieldContainer = $('<div class="jtable-input-field-container"></div>').appendTo($editForm);
                if(self.options.bootstrap3){
                    $fieldContainer.addClass('form-group');
                }

                //Create a label for input
                $fieldContainer.append(self._createInputLabelForRecordField(fieldName));

                //Create input element with it's current value
                var currentValue = self._getValueForRecordField(record, fieldName);
                $fieldContainer.append(
                    self._createInputForRecordField({
                        fieldName: fieldName,
                        value: currentValue,
                        record: record,
                        formType: 'edit',
                        form: $editForm
                    }));
            }

            self._makeCascadeDropDowns($editForm, record, 'edit');

            //Open dialog
            self._$editingRow = $tableRow;
            if(self.options.bootstrap3){
            	self._$editDiv.find('.modal-body').empty().append($editForm);
                self._$editDiv.modal('show');
            } else {
                self._$editDiv.append($editForm).dialog('open');
            }
            self._trigger("formCreated", null, { form: $editForm, formType: 'edit', record: record, row: $tableRow });
        },

        /* Saves editing form to the server and updates the record on the table.
        *************************************************************************/
        _saveEditForm: function ($editForm, $saveButton) {
            var self = this;
            self._submitFormUsingAjax(
                $editForm.attr('action'),
                $editForm.serialize(),
                function (data) {
                    //Check for errors
                    if (data.Result !== 'OK') {
                        self._showError(data.Message);
                        self._setEnabledOfDialogButton($saveButton, true, self.options.messages.save);
                        return;
                    }

                    var record = self._$editingRow.data('record');

                    self._updateRecordValuesFromForm(record, $editForm);
                    self._updateRecordValuesFromServerResponse(record, data);
                    self._updateRowTexts(self._$editingRow);

                    self._$editingRow.attr('data-record-key', self._getKeyValueOfRecord(record));

                    self._onRecordUpdated(self._$editingRow, data);

                    if (self.options.animationsEnabled) {
                        self._showUpdateAnimationForRow(self._$editingRow);
                    }

                    self._$editDiv.dialog("close");
                },
                function () {
                    self._showError(self.options.messages.serverCommunicationError);
                    self._setEnabledOfDialogButton($saveButton, true, self.options.messages.save);
                });
        },

        /* This method ensures updating of current record with server response,
        * if server sends a Record object as response to updateAction.
        *************************************************************************/
        _updateRecordValuesFromServerResponse: function (record, serverResponse) {
            if (!serverResponse || !serverResponse.Record) {
                return;
            }

            $.extend(true, record, serverResponse.Record);
        },

        /* Gets text for a field of a record according to it's type.
        *************************************************************************/
        _getValueForRecordField: function (record, fieldName) {
            var field = this.options.fields[fieldName];
            var fieldValue = record[fieldName];
            if (field.type === 'date') {
                return this._getDisplayTextForDateRecordField(field, fieldValue);
            } else {
                return fieldValue;
            }
        },

        /* Updates cells of a table row's text values from row's record values.
        *************************************************************************/
        _updateRowTexts: function ($tableRow) {
            var record = $tableRow.data('record');
            var $columns = $tableRow.find('td');
            for (var i = 0; i < this._columnList.length; i++) {
                var displayItem = this._getDisplayTextForRecordField(record, this._columnList[i]);
                //if (displayItem == 0) displayItem = "0";
                $columns.eq(this._firstDataColumnOffset + i).html(displayItem || '');
            }

            this._onRowUpdated($tableRow);
        },

        /* Shows 'updated' animation for a table row.
        *************************************************************************/
        _showUpdateAnimationForRow: function ($tableRow) {
            var className = 'jtable-row-updated';
            if (this.options.jqueryuiTheme) {
                className = className + ' ui-state-highlight';
            }
            
            $tableRow.stop(true, true).addClass(className, 'slow', '', function () {
                $tableRow.removeClass(className, 5000);
            });
        },

        /************************************************************************
        * EVENT RAISING METHODS                                                 *
        *************************************************************************/

        _onRowUpdated: function ($row) {
            this._trigger("rowUpdated", null, { row: $row, record: $row.data('record') });
        },

        _onRecordUpdated: function ($row, data) {
            this._trigger("recordUpdated", null, { record: $row.data('record'), row: $row, serverResponse: data });
        }

    });

})(jQuery);
