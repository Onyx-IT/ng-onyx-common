(function () {
    'use strict';

    angular.module('onyxCommon').service('ApplicationSetup', ApplicationSetup);

    /**
     * @ngdoc function
     * @name invoiceWebApp.controller:MainCtrl
     * @description
     * # MainCtrl
     * Controller of the invoiceWebApp
     */

    /** @ngInject */
    function ApplicationSetup($scope, $location, appConfig, ONYXENV, APP_CONSTANT, NxApiService, $rootScope, $window) { // jshint ignore:line
        var service = {};
        var isLoaded = false;

        service.setup = function (appName) {
            var configUrl = '';
            if (ONYXENV.apiServerUrl || $location.host() === 'localhost') {
                configUrl = '/scripts/config/app.config.json';
            } else {
                configUrl = appName + '/scripts/config/app.config.json';
            }

            NxApiService.callLocalService(configUrl, 'GET').then(
                function (response) {
                    var appConfig = response.data;

                    if (appConfig['mock-mode']) {
                        APP_CONSTANT.API_CONFIG.ENABLE_MOCK_MODE = angular.lowercase(appConfig['mock-mode']);
                        APP_CONSTANT.API_CONFIG.MOCK_API_APP = angular.lowercase(appConfig['mock-api-app']);
                    }

                    if (ONYXENV.apiServerUrl) {
                        APP_CONSTANT.API_CONFIG.SERVER = angular.lowercase(ONYXENV.apiServerUrl);
                        APP_CONSTANT.API_CONFIG.API_APP = '';
                    } else if (appConfig['api-app']) {
                        APP_CONSTANT.API_CONFIG.SERVER = angular.lowercase(appConfig['api-server']);
                        APP_CONSTANT.API_CONFIG.API_APP = angular.lowercase(appConfig['api-app']);
                        APP_CONSTANT.API_CONFIG.APP_URL_PORT = angular.lowercase(appConfig['api-url-port']);
                        APP_CONSTANT.API_CONFIG.API_ENDPOINT = angular.lowercase(appConfig['api-endpoint']);
                        APP_CONSTANT.API_CONFIG.MOCK_URL = angular.lowercase(appConfig['mock-url']);
                    } else {
                        throw new Error('app.config.json file is missing API configuration');
                    }
                    APP_CONSTANT.API_CONFIG.RUN_TIME_CHECK = true;
                    $rootScope.loaded = true;
                    isLoaded = true;
                $window.alert('Main finished');
                },
                function (error) {
                    appConfig.message = "Code " + error.status + " Message " + error.statusText +
                        " (" + error.data.response + ")";
                    appConfig.errorCode = "IN01";
                    $location.path('error');
                    appConfig.isLoading = false;
                }
            );
            $scope.APP_CONSTANT = APP_CONSTANT;
        };

        service.isLoaded = function(){
            return isLoaded;
        };

        return service;
    }
})();