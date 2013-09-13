What is jTable
======

http://www.jtable.org

jTable is a jQuery plugin that is used to create AJAX based CRUD tables without coding HTML or Javascript. It has several features including:

* Automatically creates HTML table and loads records from server using AJAX.
* Creates 'create new record' jQueryUI dialog form. When user creates a record, it sends data to server using AJAX and adds the same record to the table in the page.
* Creates 'edit record' jQueryUI dialog form. When user edits a record, it updates server using AJAX and updates all cells on the table in the page.
* Allow user to 'delete a record' by jQueryUI dialog based confirmation. When user deletes a record, it deletes the record from server using AJAX and deletes the record from the table in the page.
* Shows animations for create/delete/edit operations on the table.
* Supports server side paging using AJAX.
* Supports server side sorting using AJAX.
* Supports master/child tables.
* Allows user to select rows.
* Allows user to resize columns.
* Allows user to show/hide columns.
* Exposes some events to enable validation with forms.
* It can be localized easily.
* All styling of table and forms are defined in a CSS file, so you can easily change style of everything to use plugin in your pages. CSS file is well defined and commented.
* It comes with pre-defined color themes.
* It is not depended on any server side technology.
* It is platform independed and works on all common browsers.

Bootstrap 3 Support
======
Requires that you link jquery-ui widgets js if you are not using jquery-ui.  version 1.10.3 is located in lib/bootstrap3-depend.

New General Options

bootstrap3 Set True to use Bootstrap version 3.  Do not use with jqueryuiTheme: true
bs3FormClass Options are '' Default, 'inline' ==> form-inline, 'horizontal' ==> 'form-horizontal' (Option bootstrap3 must be true). See http://getbootstrap.com/css/#forms
bs3UseFormGroup Adds form-group class to input divs. See http://getbootstrap.com/css/#forms
bs3CancelBtnClass Adds specified btn classes to Cancel/Close buttons. You do not need to add the btn class.  Default btn-default  See http://getbootstrap.com/css/#buttons
bs3OkBtnClass Adds specified btn classes to Ok/Save buttons. You do not need to add the btn class.  Default btn-primary  See http://getbootstrap.com/css/#buttons

New Field Options

When using bs3FormClass:'horizontal' use the following options on each field to control their width in the form layout
bs3LabelClass i.e. bs3LabelClass:'col-md-2'  See http://getbootstrap.com/css/#forms and http://getbootstrap.com/css/#grid
bs3InputColClass i.e. bs3InputColClass:'col-md-10'  See http://getbootstrap.com/css/#forms and http://getbootstrap.com/css/#grid

bootstrap-datepicker is used as the datepicker replacement.  Available at https://github.com/eternicode/bootstrap-datepicker.
Available options are the same as listed on the github page with the prefix bs3DP.  ie. bs3DPweekStart.
The format option is not used.  Instead change the jTable defaultDateFormat or field displayFormat to a compatible format as listed.

Add the following css when using the datepicker:
/*z-index override for bootstrap-datepicker in modal*/
.datepicker-dropdown{
	z-index:2000 !important;
}

Notes
======

lib folder contains all necessary files to use jTable.

dev folder contains parts of library that can be helpful for development of jTable.

See http://www.jtable.org for documantation, demos, themes and more...
