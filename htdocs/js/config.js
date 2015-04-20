angular.module("luci")
.factory('$config', function($rootScope){
	return {
		themes: {
			"default": "/themes/default/",
			"red" : "/themes/inteno-red/"
		}, 
		rpc: {
			host: "http://192.168.1.1", 
			exposed_calls: [
				"session.login", 
				"session.access", 
				"session.destroy", 
				"luci2.ui.menu", 
				"router.dslstats",
				"router.info",
				"system.info"
			]
		}
	}; 
}); 