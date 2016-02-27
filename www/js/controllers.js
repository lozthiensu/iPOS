angular.module('freePos')
.run(function($rootScope) {
    $rootScope.settingData = [];
})
.config(function(localStorageServiceProvider){
	localStorageServiceProvider.setPrefix('settingApp');
	/*
	document.addEventListener("deviceready", onDeviceReady, false); 
	function onDeviceReady(){ 
		FastClick.attach(document.body);
	}
	*/       
})
.controller('page_Home_Ctrl', function($scope, freePosSever, $rootScope, $timeout, localStorageService, $filter, $interval, $cordovaVibration) {
	$scope.langVI = [	{OK: 'Đồng ý',
						DESK: 'Bàn',
						CHOOSED: 'Đã chọn',
						CHOOSE: 'Chọn lại',
						ALL: 'Tất cả',
						PRICE: 'Giá',
						NUMBER: 'Số lượng',
						EDIT: 'Đặt thêm',
						CHECKOUT: 'Thanh toán',
						CURRENCY: 'K',
						TOTAL: 'Tổng tiền',
						SETTING: 'Cài đặt',
						SELECTDESK: 'Chọn bàn'}		];
	$scope.langEN = [	{OK: 'Ok',
						DESK: 'Desk',
						CHOOSED: 'Choosed',
						CHOOSE: 'Choose',
						ALL: 'All',
						PRICE: 'Price',
						NUMBER: 'Number',
						EDIT: 'Edit',
						CHECKOUT: 'Checkout',
						CURRENCY: 'USD',
						TOTAL: 'Total',
						SETTING: 'Setting',
						SELECTDESK: 'Select desk'}	];
						
	/*  Read setting, if this null wil initializing */
	$rootScope.settingData = localStorageService.get('settingApp'); 
	if ( !$rootScope.settingData ) {
		$rootScope.settingData = [{refreshTime: 5, lanIpAdress:'acm.svpdu.net', sound: true, vibration: true, language: 'vi'}];
	}
	/* Save setting */
	$scope.saveSetting = function(){
		if($rootScope.settingData[0].language == 'vi')
			$scope.languageView = $scope.langVI[0];
		else 
			$scope.languageView = $scope.langEN[0];
		localStorageService.set('settingApp',$scope.settingData);
	}				
	
	/*  Setting language */
	$scope.listLanguage = [{languageId: 'vi', languageName: 'Việt Nam'},{languageId: 'en', languageName: 'English'}];
	$scope.languageView;
	if($rootScope.settingData[0].language === 'vi')
		$scope.languageView = $scope.langVI[0];
	else 
		$scope.languageView = $scope.langEN[0];	
	
	/* List of desk initialized when starting applications */
	$scope.listDesk =[	{DeskID: 1, Name:"1", Status: false, Amount: 0},
						{DeskID: 2, Name:"2", Status: false, Amount: 0},
						{DeskID: 3, Name:"3", Status: false, Amount: 0},
						{DeskID: 4, Name:"4", Status: false, Amount: 0},
						{DeskID: 5, Name:"5", Status: false, Amount: 0},
						{DeskID: 6, Name:"6", Status: false, Amount: 0},
						{DeskID: 7, Name:"7", Status: false, Amount: 0},
						{DeskID: 8, Name:"8", Status: false, Amount: 0},
						{DeskID: 9, Name:"9", Status: false, Amount: 0},
						{DeskID: 10, Name:"10", Status: false, Amount: 0}	];
	
	/* List of selected products on each desk */
	$scope.listProductsOnDesk = [[],[],[],[],[],[],[],[],[],[]];
	
	/* List of products */
	$scope.listProducts = [];
	
	/* Get list of products from server */
    $scope.getListOfProductsFromSever = function() {
		freePosSever.getListOfProducts($rootScope.settingData[0].lanIpAdress).success(function(dataProducts) {
			var n = dataProducts.length, i = 0;  	
			for(; i < n; i++)
				$scope.listProducts.push(dataProducts[i]);
        }); 
    };
	$scope.getListOfProductsFromSever();
	
	/* Data refreshes every 5 seconds if allowed */
	$scope.allowRefresh = true;
	$scope.SavedSession = 0;
	$scope.soundPlay = false;	/* Play sound if true */	
    $scope.autoRefresh = function() {
		$scope.soundPlay = false;
		if($scope.allowRefresh)
			freePosSever.getCurrentSession($rootScope.settingData[0].lanIpAdress).success(function(dataSession) {
				$scope.statusSever = angular.fromJson(dataSession[0]); 
				if( ($scope.statusSever.Server != $scope.saveSound) && $rootScope.settingData[0].sound == true){
					$scope.soundPlay = true;
					$scope.saveSound = $scope.statusSever.Server;
				}			
				if( ($scope.statusSever.Server != $scope.saveSound) && $rootScope.settingData[0].vibration == true){
					$cordovaVibration.vibrate(1000);
				}			
				if( $scope.statusSever.trangthaiban != $scope.SavedSession){
					freePosSever.getListDesk($rootScope.settingData[0].lanIpAdress).success(function(dataListDesk) {
						$scope.listDesk = dataListDesk; 
					});
					freePosSever.getListProductsOnDesk($rootScope.settingData[0].lanIpAdress).success(function(dataListProductsOnDesk) {
						$scope.listProductsOnDesk = dataListProductsOnDesk; 
					}); 
				}
				$scope.SavedSession = $scope.statusSever.trangthaiban; 
			});  
    };
    $scope.intervalPromise = $interval(function(){
          $scope.autoRefresh();
    }, parseInt($rootScope.settingData[0].refreshTime) * 1000);  
    $scope.autoRefresh();
	
	/* Post data once you complete product selection for a table */
    $scope.postDataToServer = function() {		
		$scope.SavedSession++;
		var listDeskToPost = angular.toJson($scope.listDesk);
		var listProductsOnDeskToPost = angular.toJson($scope.listProductsOnDesk);
		freePosSever.postDatBan($rootScope.settingData[0].lanIpAdress, {
			trangthaiban: $scope.SavedSession,
			danhsachban: listDeskToPost,
			sanphamban: listProductsOnDeskToPost
		}).success(function(datapdus) {
			/* Do somethings */	
		});		
    };

	/* Post receipt to sever when checkout complete */
    $scope.postReceiptToSever = function(index) {
		var listProductsOnDeskToPostReceipt = angular.toJson($scope.listProductsOnDesk[index]);
		freePosSever.postReceipt($rootScope.settingData[0].lanIpAdress, {
			UserID: 'Admin',
			Guest: 'Khach',
			Total: $scope.listDesk[index].Amount,
			listProducts: listProductsOnDeskToPostReceipt
		}).success(function(datapdus) {
			/* Do somethings */	 	
		});		
    };
	
	$scope.choosingProducts = false;	//Show modal choose product if true
	$scope.reviewingProducts = false;	//Show modal review product if true
	$scope.chooseCompleted = false;		//Hide modal choose and review if true
	$scope.searchBy = []; 				//For filter products by category
	$scope.deskIsActive = null;			//Desk id are active
	
	/* Fade in right modal desk */
	$scope.classShowDeskModal = "modal animated fadeOutRightBig";
	$scope.getStatusDeskModal = function(){
		if ($scope.classShowDeskModal == "modal animated fadeInRightBig")
			$scope.classShowDeskModal = "modal animated fadeOutRightBig";
		else
			$scope.classShowDeskModal = "modal animated fadeInRightBig";
	};
	
	/* Change status between review and choosing products mode */
	$scope.setReviewChooseMode = function(){
		$scope.reviewingProducts = !$scope.reviewingProducts;
		$scope.choosingProducts = !$scope.choosingProducts;
	};
	
	/* Set search value to filter */
	$scope.setSearch = function(value){
		$scope.searchBy.CategoryId = value;
	}

	/* Add product on desk are choosing */
	$scope.addProductOnDesk = function(deskId, productAdd) {
		var alreadyExist = false;
		var numberOfProducts = 1;
		var n = $scope.listProductsOnDesk[deskId].length;
		/* If not already exist then add it, otherwise increased the number up */
		for(var i = 0; i < n; i++){
			if( $scope.listProductsOnDesk[deskId][i].ProductId == productAdd.ProductId){ 
				$scope.listProductsOnDesk[deskId][i].numberOfProducts += 1;
				numberOfProducts = $scope.listProductsOnDesk[deskId][i].numberOfProducts;
				var alreadyExist = true;
				break;
			}
		}
		if( alreadyExist == false)
			$scope.listProductsOnDesk[deskId].push(		{ProductId: productAdd.ProductId,
														ProductCode: productAdd.ProductCode,
														Name: productAdd.Name,
														Price: productAdd.Price,
														DiscountRate: productAdd.DiscountRate,
														Description: productAdd.Description,
														ImageName: productAdd.ImageName,
														ImagePath: productAdd.ImagePath,
														CategoryId: productAdd.CategoryId,
														numberOfProducts: 1}	);
		//This desk has been used
		$scope.listDesk[deskId].Status = true; 
    };
	
	/* Return number of product was add */
	$scope.returnNumberOfProduct = function(productX, deskId){
		var n = $scope.listProductsOnDesk[deskId].length;
		for(var i = 0; i < n; i++){
			if( $scope.listProductsOnDesk[deskId][i].ProductId == productX.ProductId){ 
				return $scope.listProductsOnDesk[deskId][i].numberOfProducts;
			}
		}
		
	}
	
	/*  Filter desk is empty or used */
	$scope.filterDeskStatus = [];
	$scope.filterDeskStatus.Status = '';
	$scope.changeFilterDesk = function(){
		if($scope.filterDeskStatus.Status == '')
			return ($scope.filterDeskStatus.Status = true);
		else
			return ($scope.filterDeskStatus.Status = '');
	}
	
	/* Reduce products on desk are choosing */
	$scope.reduceNumberOfProducts = function(deskId,productReduce) {
		var numberOfProducts = 0;
		var n = $scope.listProductsOnDesk[deskId].length;
		/* If have one product( number of product == 1) then remove this product on desk and set this desk to empty */
		if(n == 1 && $scope.listProductsOnDesk[deskId][0].numberOfProducts == 1){	
			$scope.listDesk[deskId].Status = false;
			$scope.listProductsOnDesk[deskId] = [];
		}
		else{
			for(var i = 0; i < n; i++){
				if( $scope.listProductsOnDesk[deskId][i].ProductId == productReduce.ProductId){ 
					/* If number of product == 1, remove this product, otherwise decrease number by 1 */
					if( $scope.listProductsOnDesk[deskId][i].numberOfProducts <= 1){ 
						$scope.listProductsOnDesk[deskId].splice(i, 1);
						break;
					}
					else{
						$scope.listProductsOnDesk[deskId][i].numberOfProducts -= 1;
						numberOfProducts = $scope.listProductsOnDesk[deskId][i].numberOfProducts;
					}
					break;
				}
			}
		}
    };
	
	/* Payment confirmation */
	$scope.paymentConfirmation = function(deskId){
		/* Delete list of product on this desk, reset desk */
		$scope.postReceiptToSever(deskId);
		$scope.listProductsOnDesk[deskId] = [];
		$scope.listDesk[deskId].Amount = 0;
		$scope.listDesk[deskId].Status = false;
		$scope.choosingProducts = true;
		$scope.reviewingProducts = false;  
		$scope.postDataToServer();
		$scope.closeModalDesk();
	}
	
	/* Set to mode add more or reduce product */
	$scope.setAddOrReduce = function(){
		$scope.choosingProducts = true;
		$scope.reviewingProducts = false;
		$scope.chooseCompleted = false;
	}
	
	/* Show top right button if  */
	$scope.showButtonTopRight = function(index){
		return ($scope.choosingProducts != $scope.reviewingProducts);		
	}
	
	/* Sum of list product price */
	$scope.totalAmountOnDesk = 0;
	$scope.calcSumAmountOnDesk = function(index){
		$scope.totalAmountOnDesk = 0;
		var n = $scope.listProductsOnDesk[index].length;
		for(var i = 0; i < n; i++){ 
			$scope.totalAmountOnDesk += $scope.listProductsOnDesk[index][i].numberOfProducts * $scope.listProductsOnDesk[index][i].Price ; 
		}
		$scope.listDesk[index].Amount = $scope.totalAmountOnDesk; 
		$scope.choosingProducts = false;
		$scope.reviewingProducts = false;
		$scope.chooseCompleted = false;
		$scope.postDataToServer();
	}
	
	/* Convert currency type Vietnam*/
	$scope.currencyVietNam = function(amountNumber){
		amountNumber = amountNumber * 1.0 / 1000;
		var currencyFilter = $filter('currency');
        var currencyValue; 
        currencySymbol = '';
        currencyValue = currencyFilter(amountNumber, currencySymbol);
        currencyValue = currencyValue.replace('.', ';');
        currencyValue = currencyValue.replace(/\,/g, ' ');
        currencyValue = currencyValue.replace(';', ',');
		var removeComma = currencyValue.split(',')[1];
		if( removeComma[0] == '0')
			currencyValue = currencyValue.split(',')[0];
		else
			currencyValue = currencyValue.split(',')[0] + ',' + removeComma[0];
		return currencyValue; 	
	}
	
	/* Initializing when tap on the desk */
	$scope.showDeskSelected = function(idBaiViet) {
		$scope.allowRefresh = false;
		$scope.getStatusDeskModal();
		$scope.deskIsActive = idBaiViet - 1;	
		/* First time to tap */
		if($scope.listDesk[idBaiViet - 1].Amount <= 0){
			$scope.chooseCompleted = false;
			$scope.choosingProducts = true;
			$scope.reviewingProducts = false;
		}
		else{
			$scope.chooseCompleted = true;
			$scope.choosingProducts = false;
			$scope.reviewingProducts = false; 
		} 
    };
	
	/* Close modal dess */
    $scope.closeModalDesk = function() {
		$scope.getStatusDeskModal();
		$timeout(function(){
			$scope.dismiss(); 
		}, 300);
		$scope.allowRefresh = true;	
    };
})

/* Close the window model */
.directive('closeMyModal', function() {
   return {
     restrict: 'A',
     link: function(scope, element, attr) {
       scope.dismiss = function() {
           element.modal('hide');
       };
     }
   } 
}) 
;