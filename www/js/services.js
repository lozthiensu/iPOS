angular.module('freePos')
.factory('freePosSever', function($http) {
    return {
        getListOfProducts: function (lanIpAddress){
            return $http.get('http://' + lanIpAddress + '/getListSanPham.php'); 
        },
        getCurrentSession: function (lanIpAddress){
            return $http.get('http://' + lanIpAddress + '/getStatusBan.php'); 
        },
        getListProductsOnDesk: function (lanIpAddress){
            return $http.get('http://' + lanIpAddress + '/getSanphamban.php'); 
        },
        getListDesk: function (lanIpAddress){
            return $http.get('http://' + lanIpAddress + '/getDanhsachban.php'); 
        },
        postReceipt: function (lanIpAddress, inforReceipt){
            return $http.post('http://' + lanIpAddress + '/postReceipt.php',inforReceipt,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
                }
            });
        },
        postDatBan: function (lanIpAddress, inforDatBan){
            return $http.post('http://' + lanIpAddress + '/postDatBan.php',inforDatBan,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
                }
            });
        }
    };
    
});