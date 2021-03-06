//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("overviewWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.html", 
		controller: "overviewWidgetWifi", 
		replace: true
	 };  
})
.directive("overviewStatusWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.small.html", 
		controller: "overviewStatusWidgetWifi", 
		replace: true
	 };  
})
.controller("overviewStatusWidgetWifi", function($scope, $uci, $rpc){
	JUCI.interval.repeat("overview-wireless", 1000, function(done){
		async.series([function(next){
			$uci.sync(["wireless"]).done(function(){
				$scope.wireless = $uci.wireless;  
				if($uci.wireless && $uci.wireless.status) {
					if($uci.wireless.status.wlan.value){
						$scope.statusClass = "text-success"; 
					} else {
						$scope.statusClass = "text-default"; 
					}
				}
				$scope.$apply(); 
				next(); 
			}); 
		}, function(next){
			$rpc.juci.broadcom.wireless.clients().done(function(result){
				$scope.done = 1; 
				var clients = {}; 
				result.clients.map(function(x){ 
					if(!clients[x.band]) clients[x.band] = []; 
					clients[x.band].push(x); 
				}); 
				$scope.wifiClients = clients; 
				$scope.wifiBands = Object.keys(clients); 
			}); 
		}], function(){
			done(); 
		}); 
	}); 
	
})
.controller("overviewWidgetWifi", function($scope, $rpc, $uci, $tr, gettext){
	$scope.wireless = {
		clients: []
	}; 
	$scope.wps = {}; 
	
	$scope.onWPSToggle = function(){
		$uci.wireless.status.wps.value = !$uci.wireless.status.wps.value; 
		$scope.wifiWPSStatus = (($uci.wireless.status.wps.value)?gettext("on"):gettext("off")); 
		$uci.save().done(function(){
			refresh(); 
		}); 
	}
	$scope.onWIFISchedToggle = function(){
		$uci.wireless.status.schedule.value = !$uci.wireless.status.schedule.value; 
		$scope.wifiSchedStatus = (($uci.wireless.status.schedule.value)?gettext("on"):gettext("off")); 
		$uci.save().done(function(){
			refresh(); 
		}); 
	}
	
	!function refresh() {
		$scope.wifiSchedStatus = gettext("off"); 
		$scope.wifiWPSStatus = gettext("off"); 
		async.series([
			function(next){
				$uci.sync(["wireless"]).done(function(){
					$scope.wifi = $uci.wireless;  
					if($uci.wireless && $uci.wireless.status) {
						$scope.wifiSchedStatus = (($uci.wireless.status.schedule.value)?gettext("on"):gettext("off")); 
						$scope.wifiWPSStatus = (($uci.wireless.status.wps.value)?gettext("on"):gettext("off")); 
					}
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$rpc.juci.broadcom.wps.showpin().done(function(result){
					$scope.wps.pin = result.pin; 
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$rpc.juci.broadcom.wireless.clients().done(function(clients){
					$scope.wireless.clients = clients.clients; 
					$scope.wireless.clients.map(function(cl){
						// calculate signal strength
						cl.snr = cl.rssi - cl.noise; 
						// check flags 
						if(cl.flags.match(/NOIP/)) cl.ipaddr = $tr(gettext("No IP address")); 
					}); 
					next(); 
				}).fail(function(){
					next();
				});
			},
		], function(){
			$scope.$apply(); 
		}); 
	}(); 
}); 
