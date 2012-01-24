;(function($) {
	$(document).ready(function() {
		
		$.klear = $.klear || {};
		
		$.klear.baseurl = $("base").attr("href");
		
		$( "#sidebar" ).accordion({
			icons : {
					header: "ui-icon-circle-arrow-e",
					headerSelected: "ui-icon-circle-arrow-s"
			},
			autoHeight: false
		});

		$("#sidebar li").on("mouseenter",function() {
			$(this).addClass("ui-state-highlight");
		}).on("mouseleave",function() {
			$("#sidebar li").removeClass("ui-state-highlight");
		});
		
		
		$("#header .langs").buttonset();
	
		$("#header button").each(function() {
			$(this).button({
				icons: {
	                primary: $(this).data("icon")
	            },
	            text: $(this).data("text")
			})
		});
		
		var $main = $("#canvas");
		
		
		$main.tabs({
			tabTemplate: "<li title='#{label}'><span class='ui-silk'></span><span class='ui-icon ui-icon-close'></span><a href='#{href}'>#{label}</a></li>",
			scrollable: true,
			add : function( event, ui ) {
				
				if ($(ui.tab).parents('ul').css('display') == 'none') {
					$(ui.tab).parents('ul').fadeIn();
				}
				var backgroundTab = false;
				
				if ($(this).data('ctrlKey')===true) {
					$(this).data('ctrlKey', false)
					backgroundTab = true;
				}
				
				if (backgroundTab !== true) {
					$main.tabs('select', ui.index);	
				}
				
				
				var $tabLi = $(ui.tab).parent("li");
				$tabLi.klearModule({
					ui: ui,
					container : $main,
					loadingSelector : '#loadingPanel' 
				}).tooltip();

				// Se invoca custom event para actualizar objeto klear.module (si fuera necesario);
				$main.trigger("tabspostadd",ui);
								
				$tabLi.klearModule("dispatch");
				
				if (backgroundTab !== true) {
					$tabLi.klearModule("highlightOn");
				}
				
				$("#tabsList li").each(function(idx,elem) {
					$(elem).klearModule("option","tabIndex",idx);
				});
			},
			select : function(event, ui) {
				$("#tabsList li").each(function(idx,elem) {
					$(elem).klearModule("highlightOff");
				});
				var $tabLi = $(ui.tab).parent("li");
				
				
				
				$tabLi
					.klearModule("selectCounter")
					.klearModule("updateLoader")
					.klearModule("highlightOn");
			},
			remove: function(event, ui) {
				$("#tabsList li").each(function(idx,elem) {
					$(elem).klearModule("option","tabIndex",idx);
				});
				
				$main.tabs('select', $main.tabs('option', 'selected'));
				
			}
			
		});
		
		$( "#tabsList").on("click","span.ui-icon-close", function() {
			var index = $( "li", $main ).index( $( this ).parent() );
			var $tab = $(this).parent("li");
			$tab.klearModule("close");
		});

		 
		$.klear.navctrlKey = function(e, $el){
			if(e.ctrlKey) {
				$el.data('ctrlKey', true);
			}
		};
		
		
		$( "#sidebar").on("click","a.subsection", function(e) {
			e.preventDefault();
			e.stopPropagation();
			var iden = $(this).attr("id").replace(/^target-/,'');
			
			$.klear.navctrlKey(e, $main);
			
			if ($("#tabs-"+iden).length > 0) {
				$main.tabs('select', '#tabs-'+iden);
				return;
			}
			var idContent = "#tabs-" + iden;
			var title = $(this).text();
			$main.tabs( "add", idContent, title);
			
		});

		
	});
	
	
	
})(jQuery);