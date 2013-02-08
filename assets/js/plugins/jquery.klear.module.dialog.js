;(function($) {

    var uiDialogClasses =
        'ui-dialog ' +
        'ui-widget ' +
        'ui-widget-content ' +
        'ui-corner-all ',
    sizeRelatedOptions = {
        buttons: true,
        height: true,
        maxHeight: true,
        maxWidth: true,
        minHeight: true,
        minWidth: true,
        width: true
    },
    resizableRelatedOptions = {
        maxHeight: true,
        maxWidth: true,
        minHeight: true,
        minWidth: true
    },
    // support for jQuery 1.3.2 - handle common attrFn methods for dialog
    attrFn = $.attrFn || {
        val: true,
        css: true,
        html: true,
        text: true,
        data: true,
        width: true,
        height: true,
        offset: true,
        click: true
    };

    var __namespace__ = "klear.moduleDialog";

    $.widget("klear.moduleDialog", $.ui.dialog, {
        _superClass: $.ui.dialog.prototype,
        _getKlearPosition: function() {
            if (this.options.klearPosition) {
                return $(this.options.klearPosition);
            }

            return document.body;
        },
        _makeDraggable : function() {
            this.uiDialog.draggable({
            	handle: '.ui-dialog-titlebar',
                containment: this._getKlearPosition()
            });

        },
        _create: function() {
            this.originalTitle = this.element.attr('title');

            /*
             * Klear Module Option
             */
            this.options.isHidden = false;

            // #5742 - .attr() might return a DOMElement
            if ( typeof this.originalTitle !== "string" ) {
                this.originalTitle = "";
            }

            this.options.title = this.options.title || this.originalTitle;
            var self = this,
                options = self.options,

                title = options.title || '&#160;',
                titleId = $.ui.dialog.getTitleId(self.element),

                uiDialog = (self.uiDialog = $('<div></div>'))
                    .appendTo(this._getKlearPosition())
                    .hide()
                    .addClass(uiDialogClasses + options.dialogClass)
                    .css({
                        zIndex: options.zIndex
                    })
                    // setting tabIndex makes the div focusable
                    // setting outline to 0 prevents a border on focus in Mozilla
                    .attr('tabIndex', -1).css('outline', 0).keydown(function(event) {
                        if (options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
                            event.keyCode === $.ui.keyCode.ESCAPE) {

                            self.close(event);
                            event.preventDefault();
                        }
                    })
                    .attr({
                        role: 'dialog',
                        'aria-labelledby': titleId
                    })
                    .mousedown(function(event) {
                        self.moveToTop(false, event);
                    }),

                uiDialogContent = self.element
                    .show()
                    .removeAttr('title')
                    .addClass(
                        'ui-dialog-content ' +
                        'ui-widget-content')
                    .appendTo(uiDialog),

                uiDialogTitlebar = (self.uiDialogTitlebar = $('<div></div>'))
                    .addClass(
                        'ui-dialog-titlebar ' +
                        'ui-widget-header ' +
                        'ui-corner-all ' +
                        'ui-helper-clearfix'
                    )
                    .prependTo(uiDialog),

                uiDialogTitlebarClose = $('<a href="#"></a>')
                    .addClass(
                        'ui-dialog-titlebar-close ' +
                        'ui-corner-all'
                    )
                    .attr('role', 'button')
                    .hover(
                        function() {
                            uiDialogTitlebarClose.addClass('ui-state-hover');
                        },
                        function() {
                            uiDialogTitlebarClose.removeClass('ui-state-hover');
                        }
                    )
                    .focus(function() {
                        uiDialogTitlebarClose.addClass('ui-state-focus');
                    })
                    .blur(function() {
                        uiDialogTitlebarClose.removeClass('ui-state-focus');
                    })
                    .click(function(event) {
                        self.close(event);
                        return false;
                    })
                    .appendTo(uiDialogTitlebar),

                uiDialogTitlebarCloseText = (self.uiDialogTitlebarCloseText = $('<span></span>'))
                    .addClass(
                        'ui-icon ' +
                        'ui-icon-closethick'
                    )
                    .text(options.closeText)
                    .appendTo(uiDialogTitlebarClose),

                uiDialogTitle = $('<span></span>')
                    .addClass('ui-dialog-title')
                    .attr('id', titleId)
                    .html(title)
                    .prependTo(uiDialogTitlebar);

            //handling of deprecated beforeclose (vs beforeClose) option
            //Ticket #4669 http://dev.jqueryui.com/ticket/4669
            //TODO: remove in 1.9pre
            if ($.isFunction(options.beforeclose) && !$.isFunction(options.beforeClose)) {
                options.beforeClose = options.beforeclose;
            }

            uiDialogTitlebar.find("*").add(uiDialogTitlebar).disableSelection();

            if (options.draggable && $.fn.draggable) {
                self._makeDraggable();
            }
            if (options.resizable && $.fn.resizable) {
                self._makeResizable();
            }
           
            self._createButtons(options.buttons);
            self._isOpen = false;

            if ($.fn.bgiframe) {
                uiDialog.bgiframe();
            }
        },
    	close: function(event) {
    		var self = this,
    			maxZ, thisZ;
    		
    		var parentDialog = this._getKlearPosition();
    		var _uniqueIden = parentDialog.attr("id");
            
    		$(window).off("scroll."+_uniqueIden);
            
        	parentDialog.css("overflow","auto");
            
    		if (false === self._trigger('beforeClose', event)) {
    			return;
    		}

    		if (self.overlay) {
    			self.overlay.destroy();
    		}
    		self.uiDialog.unbind('keypress.ui-dialog');

    		self._isOpen = false;

    		if (self.options.hide) {
    			self.uiDialog.hide(self.options.hide, function() {
    				self._trigger('close', event);
    			});
    		} else {
    			self.uiDialog.hide();
    			self._trigger('close', event);
    		}

    		$.ui.dialog.overlay.resize();

    		// adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
    		if (self.options.modal) {
    			maxZ = 0;
    			$('.ui-dialog').each(function() {
    				if (this !== self.uiDialog[0]) {
    					thisZ = $(this).css('z-index');
    					if(!isNaN(thisZ)) {
    						maxZ = Math.max(maxZ, thisZ);
    					}
    				}
    			});
    			$.ui.dialog.maxZ = maxZ;
    		}
    		
    		
    		
    		return self;
    	},
		open: function() {
            if (this._isOpen) { return; }

            var self = this,
                options = self.options,
                uiDialog = self.uiDialog;

            self.overlay = options.modal ? new $.ui.dialog.overlay(self) : null;

            self.overlay.$el.appendTo(this._getKlearPosition());
            
            var parentDialog = this._getKlearPosition();
            var _uniqueIden = parentDialog.attr("id");
            
            parentDialog.css("overflow","hidden");
            
            self._size();

            self._position(options.position);

            uiDialog.show(options.show);
            self.moveToTop(true);
            
            
            var curScroll = $(window).scrollTop();
            
            $(window).on("scroll."+_uniqueIden,function() {
            	var _offset = $(window).scrollTop()-curScroll;
            	curScroll = $(window).scrollTop();
            	var symbol = (_offset<0)? '-=':'+=';
            	$(self.uiDialog).animate({top:symbol+Math.abs(_offset)+'px'},{duration:350, complete: function() {
            		if (parseFloat($(this).css("top")) < 0) {
            			$(this).css("top","0px");
            		}
            	}});
            	
            });

            // prevent tabbing out of modal dialogs
            if ( options.modal ) {
                uiDialog.bind( "keydown.ui-dialog", function( event ) {
                    if ( event.keyCode !== $.ui.keyCode.TAB ) {
                        return;
                    }

                    var tabbables = $(':tabbable', this),
                        first = tabbables.filter(':first'),
                        last  = tabbables.filter(':last');

                    if (event.target === last[0] && !event.shiftKey) {
                        first.focus(1);
                        return false;
                    } else if (event.target === first[0] && event.shiftKey) {
                        last.focus(1);
                        return false;
                    }
                });
            }

            // set focus to the first tabbable element in the content area or the first button
            // if there are no tabbable elements, set focus on the dialog itself
            $(self.element.find(':tabbable').get().concat(
                uiDialog.find('.ui-dialog-buttonpane :tabbable').get().concat(
                    uiDialog.get()))).eq(0).focus();

            self._isOpen = true;
            self._trigger('open');

            return self;
        },
        getContext : function() {
            return this.element;
        },
        updateContent : function(content) {
        	var self = this;
        	var initialHeight = $(self.element).height();
        	self._getKlearPosition().css("overflow","hidden");
            $(this.element).slideUp('fast',function() {
            	
            	$(this).html(content);
            	var _offset = ($(this).height() - initialHeight)/2;
            	$(self.uiDialog).stop().animate({top:'-='+_offset+'px'});
            	$(this).slideDown(function() {
            		//Corregimos posición con el nuevo tamaño
            		$(window).trigger("scroll."+self._getKlearPosition().attr("id"));	
            	});
            	
            	
            });
        },
        updateTitle : function(title) {
            $(".ui-dialog-title", this.uiDialogTitlebar).html(title);
        },
        setAsLoading : function() {
            $(this.element).html('<br /><div class="loadingCircle"></div><div class="loadingCircle1"></div>');
        }
    });


    $.extend($.ui.dialog.overlay, {

        create: function(dialog) {


            if ( (dialog.widgetName == 'klearModule') && ($(dialog.element).moduleDialog("option", "klearPosition")) ) {

                var container = $(dialog.element).moduleDialog("option", "klearPosition");
            } else {

                var container = document;

            }
            if (this.instances.length === 0) {
                // allow closing by pressing the escape key
                $(container).bind('keydown.dialog-overlay', function(event) {

                    if (!$(container).is(":visible")) return;
                    if (dialog.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
                        event.keyCode === $.ui.keyCode.ESCAPE) {

                        dialog.close(event);
                        event.preventDefault();
                    }
                });

                // handle window resize
                $(window).bind('resize.dialog-overlay', $.ui.dialog.overlay.resize);
            }


            // COmpatibilidad con overlays en los tabs
            if (container == document) {
                container = document.body;
            }

            var $el = ( $('<div></div>').addClass('ui-widget-overlay'))
                .appendTo(container)
                .css({
                    width: this.width(),
                    height: this.height()
                });



            this.instances.push($el);
            return $el;
        }
    });
})(jQuery);
