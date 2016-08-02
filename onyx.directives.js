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

                if (rule[0] === 'PR') {
                    validator = scope.rules.paymentRecord[obtainNameValidator(rule[1])];
                } else if (rule[0] === 'PA') {
                    validator = scope.rules.paymentAgency[obtainNameValidator(rule[1])];
                } else if (rule[0] === 'PP') {
                    validator = scope.rules.paymentProcess[obtainNameValidator(rule[1])];
                } else if (rule[0] === 'TX') {
                    validator = scope.rules.tax[obtainNameValidator(rule[1])];
                }

                if (validator != null) {
                    if (validator.type === 'string') {
                        if (validator.setValues === null || validator.setValues.length === 0) {
                            mCtrl.$parsers.push(stringValidator);
                            stringValidator(scope.$parent.$eval(attr.ngModel));
                        } else {
                            mCtrl.$parsers.push(selectValidator);
                            selectValidator(scope.$parent.$eval(attr.ngModel));
                        }
                    } else if (validator.type === 'integer') {
                        mCtrl.$parsers.push(integerValidator);
                        integerValidator(scope.$parent.$eval(attr.ngModel));
                    } else if (validator.type === 'decimal') {
                        mCtrl.$parsers.push(decimalValidator);
                        decimalValidator(scope.$parent.$eval(attr.ngModel));
                    } else {
                        alert("Wrong rule: " + ruleValidator);
                    }
                } else {
                    alert("Wrong rule: " + ruleValidator);
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
                    if (validator.required && (value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    } else {
                        if (value != null &&
                            value.length > validator.length) {
                            mCtrl.$setValidity('ruleValidator', false);
                        }
                    }
                    return value;
                }

                function integerValidator(value) {
                    mCtrl.$setValidity('required', true);
                    mCtrl.$setValidity('ruleValidator', true);
                    if (validator.required && (value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    } else if (value != null) {
                        var myRe = /[^0-9]/;
                        var aux = myRe.exec(value);
                        if ( aux != null ||
                            value.length > validator.length) {
                            mCtrl.$setValidity('ruleValidator', false);
                        }
                    }
                    return value;
                }

                function decimalValidator(value) {
                    mCtrl.$setValidity('required', true);
                    mCtrl.$setValidity('ruleValidator', true);
                    if (validator.required && (value === null || value.length === 0)) {
                        mCtrl.$setValidity('required', false);
                    } else if (value != null) {
                        var myRe = /[^0-9\.]/;
                        var aux = myRe.exec(value);
                        if ( aux != null ||
                            isNaN(parseFloat(value)) ||
                            value.length > validator.length ||
                            value.split('.').length > 2 ||
                            value.indexOf('.', value.length - 1) != -1 ||
                            (value.split('.').length === 2 && value.split('.')[1].length > validator.precision)) {
                            mCtrl.$setValidity('ruleValidator', false);
                        } else {
                        }
                    }
                    return value;
                }

                function selectValidator(value) {
                    mCtrl.$setValidity('ruleValidator', null);
                    mCtrl.$error.required = false;
                    if (validator.required && (value === null || value.length === 0)) {
                        mCtrl.$error.required = true;
                    } else {
                        if (value != null || value.length > 0) {
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