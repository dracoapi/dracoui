"use strict";function setUserName(t){global.user||(global.user=t,document.title="["+t+"] "+document.title)}function startTimers(){window.setInterval(function(){global.connected&&global.ws.emit("player_stats")},3e5)}function startListenToSocket(){console.log("Connecting to "+global.config.websocket),startTimers();var t=localStorage.getItem("pokemonSettings");global.pokemonSettings=t?JSON.parse(t):{};var e=io(global.config.websocket,{transports:["websocket","polling"]});global.ws=e,e.on("connect",function(){console.log("Connected to Bot"),global.connected=!0,$(".loading").text("Waiting to get GPS coordinates from client...")}),e.on("disconnect",function(){global.connected=!1}),e.on("initialized",function(t){t.username&&(console.log("Bot Ready."),console.log(t),setUserName(t.username),global.player=t.player,global.player&&($(".player").trigger("pogo:player_update"),gtag("event","level",global.player.level)),global.storage=t.storage,global.map.addToPath(t.pos)),$(".toolbar div").show(),global.ws.emit("pokemon_settings")}),e.on("pokemon_settings",function(t){global.pokemonSettings=t,localStorage.setItem("pokemonSettings",JSON.stringify(global.pokemonSettings))}),e.on("player_stats",function(t){global.player=t.player,$(".player").trigger("pogo:player_update")}),e.on("position",function(t){global.snipping||global.map.addToPath(t)}),e.on("buildings",function(t){console.log("Update Buildings");var e=Array.from(t.filter(function(t){return 0===t.type||6===t.type}),function(t){return{id:t.id,lat:t.coords.latitude,lng:t.coords.longitude,cooldown:t.pitstop.cooldown,lureExpire:!1}});global.map.addBuildings(e);var i=Array.from(t.filter(function(t){return 1===t.type}),function(t){return{id:t.id,lat:t.coords.latitude,lng:t.coords.longitude,arena:t.arena}});global.map.addArena(i);var n=Array.from(t.filter(function(t){return 2===t.type}),function(t){return{id:t.id,lat:t.coords.latitude,lng:t.coords.longitude}});global.map.addObelisk(n);var a=Array.from(t.filter(function(t){return 3===t.type}),function(t){return{id:t.id,lat:t.coords.latitude,lng:t.coords.longitude,arena:t.arena}});global.map.addLibrary(a);var o=Array.from(t.filter(function(t){return 5===t.type}),function(t){return{id:t.id,lat:t.coords.latitude,lng:t.coords.longitude}});global.map.addPortal(o);var s=Array.from(t.filter(function(t){return 7===t.type}),function(t){return{id:t.id,lat:t.coords.latitude,lng:t.coords.longitude}});global.map.addAltar(s)}),e.on("building_visited",function(t){console.log("Building Visited"),global.map.addVisitedBuilding({id:t.id,name:"",lat:t.coords.latitude,lng:t.coords.longitude,cooldown:t.pitstop.cooldown,visited:!0})}),e.on("creature_caught",function(t){console.log("Creature caught"),console.log(t);var e=t.creature;t.position&&(e.lat=t.position.lat,e.lng=t.position.lng),global.map.addCatch(e),creatureToast(e,{ball:e.ball})}),e.on("pokemon_evolved",function(t){creatureToast({id:t.evolution,name:inventory.getPokemonName(t.evolution)},{title:"A "+inventory.getPokemonName(t.pokemon.pokemon_id)+" evolved"})}),e.on("inventory_list",function(t){console.log(t),global.map.displayInventory(t)}),e.on("creature_list",function(t){console.log(t);var e=t.creatures.map(function(e){return e.iv=10*(e.attackValue+e.staminaValue),e.candies=t.candies[e.candyType],e});global.map.displayCreatureList(e,null,t.eggs_count)}),e.on("eggs_list",function(t){console.log(t),global.map.displayEggsList(t.eggs,t.max)}),e.on("route",function(t){global.map.setRoute(t)}),e.on("manual_destination_reached",function(){global.map.manualDestinationReached()}),global.ws=e}function errorToast(t){toastr.error(t,"Error",{progressBar:!0,positionClass:"toast-top-right",timeOut:"5000",closeButton:!0})}function creatureToast(t,e){if(!global.config.noPopup){var i=(e=e||{}).title||(global.snipping?"Snipe success":"Catch success"),n=global.snipping?toastr.success:toastr.info,a=t.display;t.level&&(a+=" (lvl "+t.level+")");var o=t.name.toString();1==o.length&&(o="00"+o),2==o.length&&(o="0"+o);var s="<div>"+a+"</div><div>";s+="<img src='./assets/creatures/"+o+".png' height='50' />",e.ball&&(s+="<img src='./assets/inventory/"+e.ball+".png' height='30' />"),n(s+="</div>",i,{progressBar:!0,positionClass:"toast-top-right",timeOut:5e3,closeButton:!0})}}var Map=function(t){var e=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),i=L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"),n=L.tileLayer("http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"),a=L.tileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png"),o=L.tileLayer("http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg");this.layerPillars=new L.LayerGroup,this.layerArenas=new L.LayerGroup,this.layerLibraries=new L.LayerGroup,this.layerObelisks=new L.LayerGroup,this.layerPortals=new L.LayerGroup,this.layerAltars=new L.LayerGroup,this.layerCatches=L.markerClusterGroup({maxClusterRadius:30}),this.layerPath=new L.LayerGroup,this.map=L.map(t,{layers:[e,this.layerPillars,this.layerArenas,this.layerLibraries,this.layerObelisks,this.layerPortals,this.layerCatches,this.layerAltars,this.layerCatches,this.layerPath]});var s={OpenStreetMap:e,OpenCycleMap:i,"OpenCycleMap Transport":n,Toner:a,Watercolor:o},r={Path:this.layerPath,Pillars:this.layerPillars,Arenas:this.layerArenas,Libraries:this.layerLibraries,Obelisks:this.layerObelisks,Portals:this.layerPortals,Altars:this.layerAltars,Catches:this.layerCatches};L.control.layers(s,r).addTo(this.map),this.map.on("baselayerchange",function(t){var e=t.name;localStorage.setItem("layer",e)}.bind(this));var l=localStorage.getItem("layer");l&&$(".leaflet-control-layers-base span:contains('"+l+"')").first().prev().click(),this.map.on("singleclick",function(t){this.setDestination(t.latlng)}.bind(this)),this.path=null,this.route=null,this.destination=null,this.steps=[],this.catches=[],this.pillars=[],this.arenas=[],this.libraries=[],this.obelisks=[],this.portals=[],this.altars=[],this.creatureList=[]};Map.prototype.saveContext=function(){var t=Array.from(this.pillars,function(t){return{id:t.id,lat:t.lat,lng:t.lng,visited:t.visited}});sessionStorage.setItem("available",!0),sessionStorage.setItem("steps",JSON.stringify(this.steps)),sessionStorage.setItem("catches",JSON.stringify(this.catches)),sessionStorage.setItem("pillars",JSON.stringify(t))},Map.prototype.loadContext=function(){try{"true"==sessionStorage.getItem("available")&&(console.log("Load data from storage to restore session"),this.steps=JSON.parse(sessionStorage.getItem("steps"))||[],this.catches=JSON.parse(sessionStorage.getItem("catches"))||[],this.pillars=JSON.parse(sessionStorage.getItem("pillars"))||[],this.steps.length>0&&this.initPath(),this.initPillars(),this.initArenas(),this.initLibraries(),this.initObelisks(),this.initPortals(),this.initCatches(),sessionStorage.setItem("available",!1))}catch(t){console.log(t)}},Map.prototype.initPath=function(){if(null!=this.path)return!0;if(!this.me){var t=this.steps[this.steps.length-1];this.map.setView([t.lat,t.lng],16),this.me=L.marker([t.lat,t.lng],{zIndexOffset:200}).addTo(this.map).bindPopup(t.lat.toFixed(4)+","+t.lng.toFixed(4)),$(".loading").hide()}if(this.steps.length>=2){var e=Array.from(this.steps,function(t){return L.latLng(t.lat,t.lng)});return this.path=L.polyline(e,{color:"red"}).addTo(this.layerPath),!0}return!1},Map.prototype.initCatches=function(){for(var t=0;t<this.catches.length;t++){var e=this.catches[t],i=String(e.id);i="0".repeat(3-i.length)+i;var n=L.icon({iconUrl:"./assets/pokemon/"+i+".png",iconSize:[60,60],iconAnchor:[30,30]}),a=e.name+" <br /> Cp:"+e.cp+" Iv:"+e.iv+"%";e.lvl&&(a=e.name+" (lvl "+e.lvl+") <br /> Cp:"+e.cp+" Iv:"+e.iv+"%"),L.marker([e.lat,e.lng],{icon:n,zIndexOffset:100}).bindPopup(a).addTo(this.layerCatches)}},Map.prototype.initPillars=function(){for(var t=0;t<this.pillars.length;t++){var e=this.pillars[t],i=e.visited?"./assets/img/stop_visited.png":"./assets/img/stop_available.png",n=L.icon({iconUrl:i,iconSize:[30,30],iconAnchor:[15,15]});e.marker=L.marker([e.lat,e.lng],{icon:n,zIndexOffset:50}).bindPopup(e.name).addTo(this.layerPillars)}},Map.prototype.initArenas=function(){for(var t=0;t<this.arenas.length;t++){var e=this.arenas[t],i=L.icon({iconUrl:"./assets/img/arena.png",iconSize:[40,40],iconAnchor:[20,20]});e.marker=L.marker([e.lat,e.lng],{icon:i,zIndexOffset:50}).bindPopup(e.name).addTo(this.layerArenas)}},Map.prototype.initLibraries=function(){for(var t=0;t<this.libraries.length;t++){var e=this.libraries[t],i=L.icon({iconUrl:"./assets/img/library.png",iconSize:[40,40],iconAnchor:[20,20]});e.marker=L.marker([e.lat,e.lng],{icon:i,zIndexOffset:50}).bindPopup(e.name).addTo(this.layerLibraries)}},Map.prototype.initObelisks=function(){for(var t=0;t<this.obelisks.length;t++){var e=this.obelisks[t],i=L.icon({iconUrl:"./assets/img/obelisk.png",iconSize:[40,40],iconAnchor:[20,20]});e.marker=L.marker([e.lat,e.lng],{icon:i,zIndexOffset:50}).bindPopup(e.name).addTo(this.layerObelisks)}},Map.prototype.initPortals=function(){for(var t=0;t<this.portals.length;t++){var e=this.portals[t],i=L.icon({iconUrl:"./assets/img/portal.png",iconSize:[40,40],iconAnchor:[20,20]});e.marker=L.marker([e.lat,e.lng],{icon:i,zIndexOffset:50}).bindPopup(e.name).addTo(this.layerPortals)}},Map.prototype.addToPath=function(t){if(this.steps.push(t),global.config.memory.limit&&this.steps.length>global.config.memory.mathPath){this.layerPath.clearLayers(),this.path=null;var e=Math.floor(.7*global.config.memory.mathPath);this.steps=this.steps.slice(-e)}if(this.initPath()){var i=L.latLng(t.lat,t.lng);this.path.addLatLng(i),this.me.setLatLng(i).getPopup().setContent(t.lat.toFixed(4)+","+t.lng.toFixed(4)),global.config.followPlayer&&this.map.panTo(i,{animate:!0})}},Map.prototype.addCatch=function(t){if(!t.lat){if(this.steps.length<=0)return;var e=this.steps[this.steps.length-1];t.lat=e.lat,t.lng=e.lng}var i=t.display+"<br /> CP:"+t.cp;if(t.level&&(i=t.display+" (lvl "+t.level/2+") <br /> CP:"+t.cp),this.catches.push(t),global.config.memory.limit&&this.catches.length>global.config.memory.maxCaught){console.log("Clean catches");var n=Math.floor(.7*global.config.memory.maxCaught);this.catches=this.catches.slice(-n),this.layerCatches.clearLayers(),this.initCatches()}else{var a=String(t.name);a="0".repeat(3-a.length)+a;var o=L.icon({iconUrl:"./assets/creatures/"+a+".png",iconSize:[60,60],iconAnchor:[30,30]});L.marker([t.lat,t.lng],{icon:o,zIndexOffset:100}).bindPopup(i).addTo(this.layerCatches)}},Map.prototype.addVisitedBuilding=function(t){if(t.lat){var e=this.pillars.find(function(e){return e.id==t.id});if(e)Object.assign(e,t);else{this.pillars.push(t),e=t;var i=L.icon({iconUrl:"./assets/img/stop_cooldown.png",iconSize:[30,30],iconAnchor:[15,15]});t.marker=L.marker([t.lat,t.lng],{icon:i,zIndexOffset:50}).addTo(this.layerPillars)}e.visited=!0,e&&e.marker&&(e.marker.setIcon(L.icon({iconUrl:"./assets/img/stop_cooldown.png",iconSize:[30,30],iconAnchor:[15,15]})),e.name?e.marker.bindPopup(e.name):e.marker.bindPopup(e.id))}},Map.prototype.addBuildings=function(t){for(var e=0;e<t.length;e++){var i=t[e],n=this.pillars.find(function(t){return t.id==i.id});n?i=Object.assign(n,i):this.pillars.push(i);var a="stop_available";if(i.cooldown?a="stop_cooldown":i.visited&&(a="stop_visited"),i.marker)i.marker.setIcon(L.icon({iconUrl:"./assets/img/"+a+".png",iconSize:[30,30],iconAnchor:[15,15]}));else{var o=L.icon({iconUrl:"./assets/img/"+a+".png",iconSize:[30,30],iconAnchor:[15,15]});i.marker=L.marker([i.lat,i.lng],{icon:o,zIndexOffset:50}).addTo(this.layerPillars),i.name?i.marker.bindPopup(i.name):i.marker.bindPopup("Stop<br />"+i.id)}}},Map.prototype.addArena=function(t){for(var e=0;e<t.length;e++){var i=t[e],n=this.arenas.find(function(t){return t.id==i.id});n?i=Object.assign(n,i):this.arenas.push(i);var a="arena",o=i.arena.allianceType;if(null!==o&&(a+=0===o?"_red":"_blue"),i.marker)i.marker.setIcon(L.icon({iconUrl:"./assets/img/"+a+".png",iconSize:[40,40],iconAnchor:[20,20]}));else{var s=L.icon({iconUrl:"./assets/img/"+a+".png",iconSize:[40,40],iconAnchor:[20,20]});i.marker=L.marker([i.lat,i.lng],{icon:s,zIndexOffset:50}).addTo(this.layerArenas),i.name?i.marker.bindPopup(i.name):i.marker.bindPopup("Arena<br />"+i.id)}}},Map.prototype.addLibrary=function(t){for(var e=0;e<t.length;e++){var i=t[e],n=this.libraries.find(function(t){return t.id==i.id});n?i=Object.assign(n,i):this.libraries.push(i);var a="library",o=i.arena.allianceType;if(null!==o&&(a+=0===o?"_red":"_blue"),i.marker)i.marker.setIcon(L.icon({iconUrl:"./assets/img/"+a+".png",iconSize:[40,40],iconAnchor:[20,20]}));else{var s=L.icon({iconUrl:"./assets/img/"+a+".png",iconSize:[40,40],iconAnchor:[20,20]});i.marker=L.marker([i.lat,i.lng],{icon:s,zIndexOffset:50}).addTo(this.layerLibraries),i.name?i.marker.bindPopup(i.name):i.marker.bindPopup("Library<br />"+i.id)}}},Map.prototype.addObelisk=function(t){for(var e=0;e<t.length;e++){var i=t[e],n=this.obelisks.find(function(t){return t.id==i.id});n?i=Object.assign(n,i):this.obelisks.push(i);if(i.marker)i.marker.setIcon(L.icon({iconUrl:"./assets/img/obelisk.png",iconSize:[40,40],iconAnchor:[20,20]}));else{var a=L.icon({iconUrl:"./assets/img/obelisk.png",iconSize:[40,40],iconAnchor:[20,20]});i.marker=L.marker([i.lat,i.lng],{icon:a,zIndexOffset:50}).addTo(this.layerObelisks),i.name?i.marker.bindPopup(i.name):i.marker.bindPopup("Obelisk<br />"+i.id)}}},Map.prototype.addPortal=function(t){for(var e=0;e<t.length;e++){var i=t[e],n=this.portals.find(function(t){return t.id==i.id});n?i=Object.assign(n,i):this.portals.push(i);if(i.marker)i.marker.setIcon(L.icon({iconUrl:"./assets/img/portal.png",iconSize:[40,40],iconAnchor:[20,20]}));else{var a=L.icon({iconUrl:"./assets/img/portal.png",iconSize:[40,40],iconAnchor:[20,20]});i.marker=L.marker([i.lat,i.lng],{icon:a,zIndexOffset:50}).addTo(this.layerPortals),i.name?i.marker.bindPopup(i.name):i.marker.bindPopup("Portal<br />"+i.id)}}},Map.prototype.addAltar=function(t){for(var e=0;e<t.length;e++){var i=t[e],n=this.altars.find(function(t){return t.id==i.id});n?i=Object.assign(n,i):this.altars.push(i);if(i.marker)i.marker.setIcon(L.icon({iconUrl:"./assets/img/altar.png",iconSize:[40,40],iconAnchor:[20,20]}));else{var a=L.icon({iconUrl:"./assets/img/altar.png",iconSize:[40,40],iconAnchor:[20,20]});i.marker=L.marker([i.lat,i.lng],{icon:a,zIndexOffset:50}).addTo(this.layerAltars),i.name?i.marker.bindPopup(i.name):i.marker.bindPopup("Altar<br />"+i.id)}}},Map.prototype.setRoute=function(t){var e=Array.from(t,function(t){return L.latLng(t.lat,t.lng)});null!=this.route?this.route.setLatLngs(e):this.route=L.polyline(e,{dashArray:"5, 5",color:"red",opacity:.4}).addTo(this.layerPath)},Map.prototype.displayCreatureList=function(t,e,i){console.log("Creature list"),global.active="creature",console.log(t),this.creatureList=t||this.creatureList,this.eggsCount=i||this.eggsCount||0,e?localStorage.setItem("sortCreatureBy",e):e=localStorage.getItem("sortCreatureBy")||"cp",this.creatureList="name"===e?this.creatureList.sort(function(t,i){if(t[e]!=i[e])return t[e]-i[e];var n=i.cp!=t.cp?"cp":"iv";return i[n]-t[n]}):this.creatureList.sort(function(t,i){if(t[e]!=i[e])return i[e]-t[e];if(t.name!=i.name)return t.name-i.name;var n="cp"==e?"iv":"cp";return i[n]-t[n]});var n=this.eggsCount+this.creatureList.length;$(".inventory .numberinfo").text(n+"/"+global.storage.creatures);var a=$(".inventory .data");a.html(""),this.creatureList.forEach(function(t){var e=Object.keys(t.evolutions)[0],i=e&&t.improvable&&t.candies>=e&&!t.isArenaDefender,n=i?"":"hide",o=i?"canEvolve":"",s=t.favorite?"hide":"",r=t.improvable&&e?"":"style='display:none'",l=Math.round(100*t.hp)/100,c=String(t.name);c="0".repeat(3-c.length)+c,a.append('\n            <div class="pokemon '+(t.attackValue>=5&&t.staminaValue>=5?"perfect":"")+'">\n                <div class="transfer" data-id=\''+t.id+"'>\n                    <a title='Transfer' href=\"#\" class=\"transferAction "+s+'"><img src="./assets/img/recyclebin.png" /></a>\n                    <a title=\'Evolve\' href="#" class="evolveAction '+n+'"><img src="./assets/img/evolve.png" /></a>\n                </div>\n                <span class="imgspan '+o+'">\n                    <div class="stat atk">'+t.attackValue+'</div>\n                    <div class="stat stam">'+t.staminaValue+'</div>\n                    <div class="battle-type"><img src="./assets/img/'+(t.isAttacker?"Sword":"Shild")+'_color.png"/></div>\n                    <img src="./assets/creatures/'+c+'.png" />\n                </span>\n                <span class="name">'+t.display+" lvl "+t.level/2+'</span>\n                <span class="info">CP: <strong>'+t.cp+"</strong> IV: <strong>"+t.iv+'%</strong></span>\n                <span class="info">HP: '+l+'</span>\n                <span class="info">Candies: '+t.candies+"<span "+r+">/"+e+"</span></span>\n            </div>\n        ")}),$(".pokemonsort").show(),$(".inventory").show().addClass("active")},Map.prototype.displayEggsList=function(t,e){console.log("Eggs list"),global.active="eggs",$(".inventory .sort").hide(),$(".inventory .numberinfo").text(t.length+"/"+e);var i=$(".inventory .data");i.html(""),t.forEach(function(t){if(t){var e=t.eggType,n=(t.passedDistance/1e3).toFixed(1)+" / "+(t.totalDistance/1e3).toFixed(1)+" km";t.isEggForRoost&&(n=t.passedDistance.toFixed(1)+" / "+t.totalDistance.toFixed(1)+" h"),null!==t.incubatorId&&(e=18),i.append('\n                <div class="egg">\n                    <span class="imgspan"><img src="./assets/inventory/'+e+'.png" /></span>\n                    <span>'+n+"</span>\n                </div>\n            ")}}),$(".inventory").show().addClass("active")},Map.prototype.displayInventory=function(t){console.log("Inventory list"),global.active="inventory",$(".inventory .sort").hide();var e=t.reduce(function(t,e){return t+e.count},0);$(".inventory .numberinfo").text(e+"/"+global.storage.items);var i=$(".inventory .data");i.html(""),t.forEach(function(t){var e=t.removable?"":"hide";i.append('\n            <div class="item">\n                <div class="transfer" data-id=\''+t.type+"' data-count='"+t.count+"'>\n                    <a title='Drop' href=\"#\" class=\"dropItemAction "+e+'"><img src="./assets/img/recyclebin.png" /></a>\n                </div>\n\n                <span class="count">x'+t.count+'</span>\n                <span class="imgspan"><img src="./assets/inventory/'+t.type+'.png" /></span>\n                <span class="info">'+t.display+"</span>\n            </div>\n        ")}),$(".inventory").show().addClass("active")},Map.prototype.setDestination=function(t){var e=L.popup().setLatLng(t).setContent("<div class='dest'>"+t.lat.toFixed(6)+", "+t.lng.toFixed(6)+'</div><div class="center-align"><a class="destBtn waves-effect waves-light btn">Go?</a></div>').openOn(this.map);$(".destBtn").click(function(){this.map.closePopup(e),console.log("Set destination: "+t.lat+", "+t.lng),this.destination&&this.layerPath.removeLayer(this.destination),this.destination=L.marker(t,{zIndexOffset:199,icon:new RedIcon}).bindPopup(t.lat+", "+t.lng).addTo(this.layerPath),global.ws.emit("set_destination",t)}.bind(this))},Map.prototype.manualDestinationReached=function(){this.layerPath.removeLayer(this.destination),this.destination=null};var RedIcon=L.Icon.Default.extend({options:{iconUrl:"assets/img/marker-icon-red.png"}});L.MarkerCluster.prototype.true_initialize=L.MarkerCluster.prototype.initialize,L.MarkerCluster.prototype.initialize=function(t,e,i,n){this.true_initialize(t,e,i,n),this.setZIndexOffset(200)},L.Evented.addInitHook(function(){this._singleClickTimeout=null,this.on("click",this._scheduleSingleClick,this),this.on("dblclick dragstart zoomstart",this._clearSingleClickTimeout.bind(this),this)}),L.Evented.include({_scheduleSingleClick:function(t){this._clearSingleClickTimeout(),this._singleClickTimeout=setTimeout(this._fireSingleClick.bind(this,t),500)},_fireSingleClick:function(t){t.originalEvent._stopped||this.fire("singleclick",L.Util.extend(t,{type:"singleclick"}))},_clearSingleClickTimeout:function(){null!=this._singleClickTimeout&&(clearTimeout(this._singleClickTimeout),this._singleClickTimeout=null)}});var inventory=window.inventoryService;!function(){function t(t,e){i.config.noConfirm?e():vex.dialog.confirm({unsafeMessage:t,callback:function(t){t&&e()}})}function e(){window.gtag=window.gtag||function(){};var e=localStorage.getItem("sortCreatureBy")||"cp";$("#sortBy"+e).addClass("active").siblings().removeClass("active"),$("#pokemonLink").click(function(){"1"==$(".inventory").css("opacity")&&$(".inventory .data .pokemon").length?$(".inventory").removeClass("active"):i.ws.emit("creature_list")}),$("#eggsLink").click(function(){"1"==$(".inventory").css("opacity")&&$(".inventory .data .egg").length?$(".inventory").removeClass("active"):i.ws.emit("eggs_list")}),$("#inventoryLink").click(function(){"1"==$(".inventory").css("opacity")&&$(".inventory .data .item").length?$(".inventory").removeClass("active"):i.ws.emit("inventory_list")}),$("#sortBypokemonId").click(function(){return i.map.displayCreatureList(null,"name")}),$("#sortBycp").click(function(){return i.map.displayCreatureList(null,"cp")}),$("#sortByiv").click(function(){return i.map.displayCreatureList(null,"iv")}),$("#sortBypokemonId, #sortBycp, #sortByiv").click(function(){$(this).hasClass("active")||$(this).toggleClass("active").siblings().removeClass("active")}),$(".inventory .refresh").click(function(){console.log("Refresh"),i.ws.emit(i.active+"_list")}),$(".inventory .close").click(function(){$(this).parent().removeClass("active"),$(".inventory .sort").hide()}),$(".message .close").click(function(){$(this).parent().hide()}),$(".close").click(function(){i.active=null}),$("#recycleLink").click(function(){sessionStorage.setItem("available",!1),window.location.reload()}),$("#settingsLink").click(function(){i.map.saveContext(),window.location="config.html"}),$(".inventory .data").on("click","a.transferAction",function(e){e.preventDefault();var n=$(this).parent(),a=n.data().id,o=i.map.creatureList.findIndex(function(t){return t.id==a}),s=i.map.creatureList[o],r=i.map.creatureList.filter(function(t){return t.name==s.name}).length-1;t("Are you sure you want to transfer this "+s.display+"? <br /> You will have <b>"+r+"</b> left.",function(){gtag("event","transfer",s.display),i.ws.emit("transfer_creature",{id:a}),i.map.creatureList.splice(o,1),n.parent().fadeOut()})}),$(".inventory .data").on("click","a.evolveAction",function(e){e.preventDefault();var n=$(this).parent(),a=n.data().id,o=i.map.creatureList.findIndex(function(t){return t.id==a}),s=i.map.creatureList[o],r=i.map.creatureList.filter(function(t){return t.name==s.name}).length-1;t("Are you sure you want to evolve this "+s.display+"? <br /> You will have <b>"+r+"</b> left.",function(){gtag("event","evolve",name),console.log("Evolve "+a),i.ws.emit("evolve_creature",{id:a,to:Object.values(s.evolutions)[0]}),i.map.creatureList.splice(o,1),n.parent().fadeOut()})}),$(".inventory .data").on("click","a.favoriteAction",function(t){t.preventDefault();var e=$(this).parent(),n=e.data().id,a=i.map.creatureList.findIndex(function(t){return t.id==n}),o=i.map.creatureList[a];o.favorite=!o.favorite;var s=inventoryService.getPokemonName(o.pokemonId);gtag("event","favorite",s),$(this).find("img").attr("src","./assets/img/favorite_"+(o.favorite?"set":"unset")+".png"),e.find(".transferAction").toggleClass("hide"),i.ws.emit("favorite_creature",{id:n,favorite:o.favorite})}),$(".inventory .data").on("click","a.dropItemAction",function(t){t.preventDefault();var e=$(this).parent(),n=e.data().id,a=inventoryService.getItemName(n),o=e.data().count;vex.dialog.confirm({unsafeMessage:"How many <b>"+a+"</b> would you like to drop?",input:'\n                    <p class="range-field">\n                        <input type="range" name="count" value="1" min="1" max="'+o+"\" onchange=\"$('#display-range').text(this.value)\" />\n                    </p>\n                    Drop: <span id='display-range'>1</span>\n                ",callback:function(t){if(t){var s=parseInt(t.count);gtag("event","drop_items",a),i.ws.emit("drop_items",{id:n,count:s}),o==s?e.parent().fadeOut():(e.data("count",o-s),e.parent().find(".count").text("x"+(o-s)))}}})}),$(".player").on("pogo:player_update",function(){if(i.player){var t=$(".player");t.find(".playername .value").text(i.user),t.find(".level .value").text(i.player.level);var e=100*i.player.currentExperience/i.player.nextLevelExperience;t.find(".myprogress .value").css("width",e.toFixed(0)+"%"),t.show()}}),i.config.websocket?(i.map=new Map("map"),i.map.loadContext(),startListenToSocket()):window.location="config.html"}var i={storage:{items:350,creatures:250},snipping:!1};window.global=i,i.config=window.configService.load(),i.version=i.config.version,document.title+=" - "+i.version,$(function(){e()})}();