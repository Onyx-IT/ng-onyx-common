(function () {
    'use strict';

    angular.module('onyxCommon').service('NxApiService', NxApiService);

    /** @ngInject */
    function NxApiService($http, $q, $location, appConfig, APP_CONSTANT) { // jshint
        // ignore:line
        var service = {};

        service.callLocalService = function (serviceName, callMethod, payload, errorLocation) {
            return service
                ._callService(serviceName, callMethod, payload, errorLocation, false);
        };

        service.callService = function (serviceName, callMethod, payload, errorLocation,
                                        contentType, responseType) {

            return service._callService(serviceName, callMethod, payload, errorLocation,
                true, contentType, responseType);
        };

        service._callService = function (serviceName, callMethod, payload, errorLocation,
                                         isRemote, contentType, responseType) {
            var deferred = $q.defer();
            var apiLocation = _createURL(serviceName, callMethod, isRemote);

            // IE cache Ajax calls. appending current date and time will burst
            // the cache
            apiLocation = apiLocation + '?t=' + new Date().getTime();

            if (!responseType)
                responseType = "json";

            if (contentType) {
                if (contentType === 'multipart/form-data') {
                    contentType = undefined;
                } else {
                    $http.defaults.headers.put["Content-Type"] = contentType;
                }
            } else {// default should be JSON
                contentType = "application/json";
            }

            $http({
                method: callMethod,
                url: apiLocation,
                data: payload,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                responseType: responseType
            }).then(function (success) {
                var responseHeaders = _headersGetter(success.headers);

                if (responseHeaders) {
                    var newToken = success.headers('authorization');
                    if (newToken) {
                        appConfig.TOKEN = newToken;
                        $http.defaults.headers.common.Authorization = newToken;
                    }
                }
                deferred.resolve(success);
            }, function (fail) {
                var failOutputBase = fail.data;
                if (failOutputBase != null && failOutputBase.errors != null && failOutputBase.errors.length > 0) {
                    appConfig.message = failOutputBase.errors[0].message;
                    appConfig.errorCode = failOutputBase.errors[0].code;
                    appConfig.exceptionCode = failOutputBase.errors[0].exceptionCode;
                }
                if (errorLocation) {
                    $location.path(errorLocation);
                }
                deferred.reject(fail);
            });
            return deferred.promise;
        };

        var _headersGetter = function (headers) {
            var headersObj;

            return function (name) {
                if (!headersObj)
                    headersObj = parseHeaders(headers);// jshint ignore:line

                if (name) {
                    var value = headersObj[angular.lowercase(name)];
                    if (value === void 0) {
                        value = null;
                    }
                    return value;
                }

                return headersObj;
            }
        };

        var _createURL = function (serviceName, callMethod, isRemote) {
            var apiLocation = "";

            if (!isRemote) {
                apiLocation = $location.protocol() + '://';
                apiLocation = apiLocation + $location.host();
                apiLocation = apiLocation + ':' + $location.port();
                // if Backendless mode use the data dir
                apiLocation = apiLocation + serviceName;
                return apiLocation;
            }

            apiLocation = service.getApiServerUrl();

            apiLocation = apiLocation + '/rest/public' + serviceName;

            return apiLocation;
        };

        service.getApiServerUrl = function () {
            var apiLocation = $location.protocol() + '://';
            $http.defaults.headers.common.Authorization = appConfig.TOKEN;

            apiLocation = apiLocation + APP_CONSTANT.API_CONFIG.SERVER;

            return apiLocation;
        };
        return service;
    }
})();