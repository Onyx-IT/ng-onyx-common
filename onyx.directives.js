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
})();