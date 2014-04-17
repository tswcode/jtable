/************************************************************************
* SORTING extension for jTable                                          *
*************************************************************************/
(function ($) {

    //Reference to base object members
    var base = {
        _initializeFields: $.hik.jtable.prototype._initializeFields,
        _normalizeFieldOptions: $.hik.jtable.prototype._normalizeFieldOptions,
        _createHeaderCellForField: $.hik.jtable.prototype._createHeaderCellForField,
        _createRecordLoadUrl: $.hik.jtable.prototype._createRecordLoadUrl,
        _createJtParamsForLoading: $.hik.jtable.prototype._createJtParamsForLoading
    };

    //extension members
    $.extend(true, $.hik.jtable.prototype, {

        /************************************************************************
        * DEFAULT OPTIONS / EVENTS                                              *
        *************************************************************************/
        options: {
            sorting: false,
            multiSorting: false,
            defaultSorting: ''
        },

        /************************************************************************
        * PRIVATE FIELDS                                                        *
        *************************************************************************/

        _lastSorting: null, //Last sorting of the table

        /************************************************************************
        * OVERRIDED METHODS                                                     *
        *************************************************************************/

        /* Overrides base method to create sorting array.
        *************************************************************************/
        _initializeFields: function () {
            base._initializeFields.apply(this, arguments);

            this._lastSorting = [];
            if (this.options.sorting) {
                this._buildDefaultSortingArray();
            }
        },

        /* Overrides _normalizeFieldOptions method to normalize sorting option for fields.
        *************************************************************************/
        _normalizeFieldOptions: function (fieldName, props) {
            base._normalizeFieldOptions.apply(this, arguments);
            props.sorting = (props.sorting !== false);
        },

        /* Overrides _createHeaderCellForField to make columns sortable.
        *************************************************************************/
        _createHeaderCellForField: function (fieldName, field) {
            var $headerCell = base._createHeaderCellForField.apply(this, arguments);
            if (this.options.sorting && field.sorting) {
                this._makeColumnSortable($headerCell, fieldName);
            }

            return $headerCell;
        },

        /* Overrides _createRecordLoadUrl to add sorting specific info to URL.
        *************************************************************************/
        _createRecordLoadUrl: function () {
            var loadUrl = base._createRecordLoadUrl.apply(this, arguments);
            loadUrl = this._addSortingInfoToUrl(loadUrl);
            return loadUrl;
        },

        /************************************************************************
        * PRIVATE METHODS                                                       *
        *************************************************************************/

        /* Builds the sorting array according to defaultSorting string
        *************************************************************************/
        _buildDefaultSortingArray: function () {
            var self = this;

            $.each(self.options.defaultSorting.split(","), function (orderIndex, orderValue) {
                $.each(self.options.fields, function (fieldName, fieldProps) {
                    if (fieldProps.sorting) {
                        var colOffset = orderValue.indexOf(fieldName);
                        if (colOffset > -1) {
                            if (orderValue.toUpperCase().indexOf(' DESC', colOffset) > -1) {
                                self._lastSorting.push({
                                    fieldName: fieldName,
                                    sortOrder: 'DESC'
                                });
                            } else {
                                self._lastSorting.push({
                                    fieldName: fieldName,
                                    sortOrder: 'ASC'
                                });
                            }
                        }
                    }
                });
            });
        },

        /* Makes a column sortable.
        *************************************************************************/
        _makeColumnSortable: function ($columnHeader, fieldName) {
            var self = this;
            
            $columnHeader
                .addClass('jtable-column-header-sortable')
                .click(function (e) {
                    e.preventDefault();

                    if (!self.options.multiSorting || !e.ctrlKey) {
                        self._lastSorting = []; //clear previous sorting
                    }
                    
                    self._sortTableByColumn($columnHeader);
                });
                
            var $span = $('<span />')
                    .addClass('jtable-sortable-icon')
                    .appendTo($columnHeader.find('.jtable-column-header-container'));

            if(self.options.bootstrap3) {
                $span.addClass("glyphicon glyphicon-sort pull-right");
            }

            //Set default sorting
            $.each(this._lastSorting, function (sortIndex, sortField) {
                if (sortField.fieldName === fieldName) {
                    if (sortField.sortOrder === 'DESC') {
                        $columnHeader.addClass('jtable-column-header-sorted-desc');
                        
                    } else {
                        $columnHeader.addClass('jtable-column-header-sorted-asc');
                    }
                    
                    if (self.options.bootstrap3) {
                        $columnHeader
                                .find('.jtable-sortable-icon')
                                .removeClass("glyphicon-sort")
                                .addClass(sortField.sortOrder === 'DESC' ? "glyphicon-sort-by-alphabet" : "glyphicon-sort-by-alphabet-alt");
                    }
                }
            });
        },

        /* Sorts table according to a column header.
        *************************************************************************/
        _sortTableByColumn: function ($columnHeader) {
            //Remove sorting styles from all columns except this one
            if (this._lastSorting.length === 0) {
                $columnHeader.siblings()
                        .removeClass('jtable-column-header-sorted-asc jtable-column-header-sorted-desc')
                        .find('.jtable-sortable-icon')
                        .removeClass('glyphicon-sort-by-alphabet glyphicon-sort-by-alphabet-alt')
                        .addClass('glyphicon-sort');
            }

            //If current sorting list includes this column, remove it from the list
            for (var i = 0; i < this._lastSorting.length; i++) {
                if (this._lastSorting[i].fieldName === $columnHeader.data('fieldName')) {
                    this._lastSorting.splice(i--, 1);
                }
            }

            //Sort ASC or DESC according to current sorting state
            if ($columnHeader.hasClass('jtable-column-header-sorted-asc')) {
                $columnHeader.removeClass('jtable-column-header-sorted-asc').addClass('jtable-column-header-sorted-desc');
                $columnHeader
                        .find('.jtable-sortable-icon')
                        .removeClass("glyphicon-sort glyphicon-sort-by-alphabet")
                        .addClass("glyphicon-sort-by-alphabet-alt");
                this._lastSorting.push({
                    'fieldName': $columnHeader.data('fieldName'),
                    sortOrder: 'DESC'
                });
            } else {
                $columnHeader.removeClass('jtable-column-header-sorted-desc').addClass('jtable-column-header-sorted-asc');
                $columnHeader
                        .find('.jtable-sortable-icon')
                        .removeClass("glyphicon-sort glyphicon-sort-by-alphabet-alt")
                        .addClass("glyphicon-sort-by-alphabet");
                this._lastSorting.push({
                    'fieldName': $columnHeader.data('fieldName'),
                    sortOrder: 'ASC'
                });
            }

            //Load current page again
            this._reloadTable();
        },

        /* Adds jtSorting parameter to a URL as query string.
        *************************************************************************/
        _addSortingInfoToUrl: function (url) {
            if (!this.options.sorting || this._lastSorting.length === 0) {
                return url;
            }

            var sorting = [];
            $.each(this._lastSorting, function (idx, value) {
                sorting.push(value.fieldName + ' ' + value.sortOrder);
            });

            return (url + (url.indexOf('?') < 0 ? '?' : '&') + 'jtSorting=' + sorting.join(","));
        },

        /* Overrides _createJtParamsForLoading method to add sorging parameters to jtParams object.
        *************************************************************************/
        _createJtParamsForLoading: function () {
            var jtParams = base._createJtParamsForLoading.apply(this, arguments);

            if (this.options.sorting && this._lastSorting.length) {
                var sorting = [];
                $.each(this._lastSorting, function (idx, value) {
                    sorting.push(value.fieldName + ' ' + value.sortOrder);
                });

                jtParams.jtSorting = sorting.join(",");
            }

            return jtParams;
        }

    });

})(jQuery);