(function () {
    'use strict';
    angular.module('onyxCommon').directive('jsonDirective', function() {
        return {
            require : 'ngModel',
            link : function(scope, element, attr, mCtrl) {
                function myValidation(value) {

                    var control = true;
                    try {
                        JSON.parse(value);
                    }catch (e) {
                        control = false;
                    }
                    mCtrl.$setValidity('numeric', control);
                    return value;

                }
                mCtrl.$parsers.push(myValidation);
            }
        };
    });
    angular.module('onyxCommon').directive('numericDirective', function() {
        return {
            require : 'ngModel',
            link : function(scope, element, attr, mCtrl) {
                function myValidation(value) {
                    var isNumber = !isNaN(parseFloat(value)) && isFinite(value);
                    mCtrl.$setValidity('numeric', isNumber);
                    return value;
                }
                mCtrl.$parsers.push(myValidation);
            }
        };
    });

    angular.module('onyxCommon').directive('integerDirective', function() {
        return {
            require : 'ngModel',
            link : function(scope, element, attr, mCtrl) {
                function myValidation(value) {
                    var isNumber = (parseInt(value, 10) == value);// jshint ignore:line
                    mCtrl.$setValidity('numeric', isNumber);
                    return value;
                }
                mCtrl.$parsers.push(myValidation);
            }
        };
    });

    angular.module('onyxCommon').directive('ruleValidator', function() {
        return {
            require : 'ngModel',
            link : function(scope, element, attr, mCtrl) {
                var ruleValidator = attr.ruleValidator;
                var rule = ruleValidator.split(".");
                var validator = null;

                var rule_0 = rule[0];
                var rule_1 = rule[1];

                if (rule_0 === 'pr') {
                    validator = scope.rules.paymentRecord[rule_1];
                } else if (rule_0 === 'pa') {
                    validator = scope.rules.paymentAgency[rule_1];
                } else if (rule_0 === 'pp') {
                    validator = scope.rules.paymentProcess[rule_1];
                } else if (rule_0 === 'tx') {
                    validator = scope.rules.tax[rule_1];
                }

                if (validator != null) {
                    if (validator.type === 'string') {
                        if (validator.setValues === null || validator.setValues.length === 0) {
                            mCtrl.$parsers.push(stringValidator);
                            //stringValidator(scope.$parent.$eval(attr.ngModel));
                            stringValidator(scope.$eval(attr.ngModel));
                        } else {
                            mCtrl.$parsers.push(selectValidator);
                            //selectValidator(scope.$parent.$eval(attr.ngModel));
                            selectValidator(scope.$eval(attr.ngModel));
                        }
                    } else if (validator.type === 'integer') {
                        if (rule_1.endsWith('Date')) {
                            //mCtrl.$parsers.push(dateValidator);
                            //integerValidator(scope.$parent.$eval(attr.ngModel));
                            //dateValidator(scope.$eval(attr.ngModel));
                        } else {
                            mCtrl.$parsers.push(integerValidator);
                            //integerValidator(scope.$parent.$eval(attr.ngModel));
                            integerValidator(scope.$eval(attr.ngModel));
                        }
                    } else if (validator.type === 'decimal') {

                        mCtrl.$parsers.push(decimalValidator);
                        //decimalValidator(scope.$parent.$eval(attr.ngModel));
                        decimalValidator(scope.$eval(attr.ngModel));
                    } else {
                        //alert("Wrong rule: " + ruleValidator);
                    }
                } else {
                    //alert("Wrong rule: " + ruleValidator);
                }

                function obtainNameValidator(ruleName) {
                    var items = ruleName.split("_");
                    var result = "";
                    for(var i = 0; i < items.length; i++) {
                        if (i === 0) {
                            result = result + items[i].toLowerCase();
                        } else {
                            result = result + items[i].charAt(0).toUpperCase() + items[i].slice(1).toLowerCase();
                        }
                    }
                    return result;
                }

                function stringValidator(value) {
                    mCtrl.$setValidity('required', true);
                    mCtrl.$setValidity('ruleValidator', true);
                    if (validator.required && (value == undefined || value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    } else {
                        if (value != undefined &&
                            value != null &&
                            value.length > validator.length) {
                            mCtrl.$setValidity('ruleValidator', false);
                        }
                    }
                    return value;
                }

                function integerValidator(value) {
                    mCtrl.$setValidity('required', true);
                    mCtrl.$setValidity('ruleValidator', true);
                    if (validator.required && (value == undefined || value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    } else if (value != undefined && value != null && value.length > 0) {
                        var myRe = /[^0-9]/;
                        var aux = myRe.exec(value);
                        if ( aux != null ||
                            value.length > validator.length) {
                            mCtrl.$setValidity('ruleValidator', false);
                        }
                    }
                    return value;
                }

                function dateValidator(value) {
                    mCtrl.$setValidity('required', true);
                    if (validator.required && (value == undefined || value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    }
                    return value;
                }

                function decimalValidator(value) {
                    var canBeNegative = false;
                    if (mCtrl.$name === "adjustmentAmount" ||
                        mCtrl.$name === "totalTaxAmount" ||
                        mCtrl.$name === "taxAmount" ||
                        mCtrl.$name === "taxPercentageUsed" ||
                        mCtrl.$name === 'totalTaxAmountTax' ||
                        mCtrl.$name === "netCommissionDue") {
                        canBeNegative = true;
                    }
                    mCtrl.$setValidity('required', true);
                    mCtrl.$setValidity('ruleValidator', true);
                    if (validator.required && (value == undefined || value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    } else if (value != undefined && value != null && value.length > 0) {
                        var myRe = null;
                        if (canBeNegative) {
                            myRe = /[^-?0-9\.]/;
                        } else {
                            myRe = /[^0-9\.]/;
                        }
                        var aux = myRe.exec(value);
                        if ( aux != null || isNaN(parseFloat(value)))
                        {
                            mCtrl.$setValidity('ruleValidator', false);
                            return value;
                        }
                        if (value.startsWith("-")) {
                            // is a negative number
                            if (value.split('.').length > 2 ||
                                value.indexOf('.', value.length - 1) != -1 ||
                                (value.split('.').length === 1 && value.length > ((validator.length + 1) - validator.precision)) ||
                                (value.split('.').length === 2 && (value.split('.')[0].length > ((validator.length + 1) - validator.precision) || value.split('.')[1].length > validator.precision))) {
                                mCtrl.$setValidity('ruleValidator', false);
                                return value;
                            }
                        } else {
                            // is a positive number
                            if (value.split('.').length > 2 ||
                                value.indexOf('.', value.length - 1) != -1 ||
                                (value.split('.').length === 1 && value.length > (validator.length - validator.precision)) ||
                                (value.split('.').length === 2 && (value.split('.')[0].length > (validator.length - validator.precision) || value.split('.')[1].length > validator.precision))) {
                                mCtrl.$setValidity('ruleValidator', false);
                                return value;
                            }
                        }
                    }
                    return value;
                }
                function selectValidator(value) {
                    mCtrl.$setValidity('required', true);
                    mCtrl.$setValidity('ruleValidator', true);
                    if (validator.required && (value == undefined || value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    } else {
                        if (value != undefined && value != null && value.length > 0) {
                            var found = false;
                            for (var i = 0; i < validator.setValues.length && !found; i++) {
                                if (value === validator.setValues[i].code) {
                                    found = true;
                                }
                            }
                            if (!found) {
                                mCtrl.$setValidity('ruleValidator', false);
                            }
                        }
                    }
                    return value;
                }

            }
        };
    });

})();