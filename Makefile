include $(TOPDIR)/rules.mk


PKG_NAME:=luciexpress
PKG_VERSION:=master
PKG_MAINTAINER:=Martin K. Schröder <martin.schroder@inteno.se>

#PKG_SOURCE_URL:=https://github.com/mkschreder/luci-express.git
#PKG_SOURCE_URL:=/home/martin/luci-express
#PKG_SOURCE_PROTO:=git
#PKG_SOURCE_VERSION:=HEAD
#PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
#PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION)-$(PKG_SOURCE_VERSION).tar.gz

PKG_RELEASE:=3

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

#define Build/Configure
	#(cd $(PKG_BUILD_DIR) && $(BASH) -x ./bootstrap)
#	$(CP) ./share ./htdocs $(PKG_BUILD_DIR)/
#	$(call Build/Configure/Default)
#endef

define Build/Prepare
	$(INSTALL_DIR) $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Package/luciexpress
  SECTION:=luciexpress
  CATEGORY:=LuCiexpress
  TITLE:=LuCiExpress UI
  DEPENDS:=+rpcd +rpcd-mod-iwinfo +uhttpd +uhttpd-mod-ubus +libubox +libubus
endef

define Package/luciexpress/description
 Provides the LuCIexpress web interface with standard functionality.
endef

define Package/luciexpress/install
	$(INSTALL_DIR) $(1)/www
	$(CP) ./htdocs/* $(1)/www/
	$(INSTALL_DIR) $(1)/usr/share/rpcd
	$(CP) ./share/* $(1)/usr/share/rpcd/
	$(INSTALL_DIR) $(1)/usr/lib/rpcd
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/rpcd/luciexpress.so $(1)/usr/lib/rpcd/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/rpcd/bwmon.so $(1)/usr/lib/rpcd/
	$(INSTALL_DIR) $(1)/usr/libexec $(1)/www/cgi-bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/io/luciexpress-io $(1)/usr/libexec/
	$(LN) /usr/libexec/luciexpress-io $(1)/www/cgi-bin/luci-upload
	$(LN) /usr/libexec/luciexpress-io $(1)/www/cgi-bin/luci-backup
endef

define Package/luciexpress/postinst
#!/bin/sh

if [ "$$(uci -q get uhttpd.main.ubus_prefix)" != "/ubus" ]; then
	uci set uhttpd.main.ubus_prefix="/ubus"
	uci commit uhttpd
fi

exit 0
endef

$(eval $(call BuildPackage,luciexpress))