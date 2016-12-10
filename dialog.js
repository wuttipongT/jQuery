	(function(factory) {
	    /// <reference path="https://github.com/kylefox/jquery-modal/blob/master/jquery.modal.js" />
	    if (typeof module === "object" && typeof module.exports === "object") {
	        factory(require("jquery"), window, document)
	    } else {
	        factory(jQuery, window, document)
	    }
	}(function($, window, document, undefined) {
	    var boxs = [],
	        getCurrent = function() {
	            return boxs.length ? boxs[boxs.length - 1] : null
	        },
	        selectCurrent = function() {
	            var i,
	                selected = false

	            for (i = boxs.length - 1; i >= 0; i--) {
	                if (boxs[i].$blocker) {
	                    boxs[i].$blocker.toggleClass('current', !selected).toggleClass('behind', selected)
	                    selected = true
	                }
	            }
	        },
	        plug = true
	    $.box = function(el, options) {
	        var remove, target
	        this.$body = $('body')
	        this.options = $.extend({}, $.box.defaults, options)
	        this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10))
	        this.$blocker = null
	        this.html = [
	            '<div class="aside bs-docs-aside left am-slide-left" tabindex="-1" role="dialog" style="display:none;">',
	            '<div class="close">',
	            '<div class="btn btn-round btn-info" name="hide" rel="box:close"><i class="md md-close"></i></div>',
	            '</div>',
	            '<div class="aside-dialog">',
	            '<div class="aside-body bs-sidebar"></div>',
	            '</div>',
	            '</div>'
	        ]

	        if (this.options.multiple) {
	            boxs.push(this)
	        } else {
	            if (!boxs.length) {
	                boxs.push(this)
	            }
	        }

	        this.$elm = $('<div>')
	        this.$body.append(this.$elm)
	        remove = function(event, box) { box.elm.remove() }
	        var current = getCurrent()
	        current.$elm.empty().append(el[0]) //.on($.box.CLOSE, remove)
	        current.open()

	    }
	    $.box.prototype = {
	        constructor: $.box,
	        open: function() {
	            var m = this
	            this.block()
	            if (!this.options.multiple) {
	                if (this.options.doFade && plug) {
	                    setTimeout(function() {
	                        m.show()
	                    }, this.options.fadeDuration * this.options.fadeDelay)
	                    plug = false
	                } else {
	                    this.show()
	                }
	            } else {
	                if (this.options.doFade) {
	                    setTimeout(function() {
	                        m.show()
	                    }, this.options.fadeDuration * this.options.fadeDelay)
	                } else {
	                    this.show()
	                }
	            }
	            $(document).off('keydown.box').on('keydown.box', function(event) {
	                var current = getCurrent()
	                if (event.which == 27 && current.options.escapeClose) current.close()
	            })
	        },
	        close: function() {
	            boxs.pop()
	            this.unblock()
	            this.hide()
	            plug = true
	            if (!$.box.isActive()) {
	                $(document).off('keydown.box')
	            }
	            if (this.options.closeExisting) {
	                while ($.box.isActive()) {
	                    $.box.close() // Close any open modals.
	                }
	            }
	        },
	        show: function() {
	            this.$elm.trigger($.box.BEFORE_OPEN, [this._ctx()])
	            this.$elm.appendTo(this.$blocker.find('div.aside-body'))

	            if (this.options.doFade) {
	                this.$elm.css('opacity', 0).show().animate({ opacity: 1 }, this.options.fadeDuration)
	            } else {
	                // Most effect types need no options passed by default
	                this.$elm.show()
	            }
	            this.$elm.trigger($.box.OPEN, [this._ctx()])
	        },
	        block: function() {
	            this.$elm.trigger($.box.BEFORE_BLOCK, [this._ctx()])
	            if (this.options.multiple) {
	                this.$blocker = $(this.html.join('')).addClass(this.options.modalClass).appendTo(this.$body)
	            } else {
	                if (this.$blocker == null) {
	                    this.$blocker = $(this.html.join('')).addClass(this.options.modalClass).appendTo(this.$body)
	                }
	            }

	            var options = {},
	                effect = this.options.effect
	                // some effects have required parameters
	            if (effect === "scale") {
	                options = { percent: 50 }
	            } else if (effect === "size") {
	                options = { to: { width: 280, height: 185 } }
	            } else if (effect === "slide") {
	                options = { direction: 'left' }
	            }
	            this.$blocker.show(effect, options, this.options.fadeDuration)
	            selectCurrent()
	            this.$elm.trigger($.box.BLOCK, [this._ctx()])

	        },
	        unblock: function(now) {
	            if (!now && this.options.doFade)
	                this.$blocker.fadeOut(this.options.fadeDuration, () => this.$blocker.remove()) //this.unblock.bind(this,true)
	            else {
	                this.$blocker.children().appendTo(this.$body)
	                this.$blocker.remove()
	                this.$blocker = null
	                selectCurrent()
	                if (!$.box.isActive())
	                    this.$body.css('overflow', '')
	            }
	        },
	        hide: function() {
	            this.$elm.trigger($.box.BEFORE_CLOSE, [this._ctx()])
	            var _this = this
	            if (this.options.doFade) {
	                this.$elm.fadeOut(this.options.fadeDuration, function() {
	                    _this.$elm.trigger($.box.AFTER_CLOSE, [_this._ctx()])
	                })
	            } else {
	                this.$elm.hide(0, function() {
	                    _this.$elm.trigger($.box.AFTER_CLOSE, [_this._ctx()])
	                })
	            }
	            this.$elm.trigger($.box.CLOSE, [this._ctx()])
	        },
	        //Return context for custom events
	        _ctx: function() {
	            return { elm: this.$elm, $blocker: this.$blocker, options: this.options }
	        }
	    }
	    $.box.close = function(event) {
	            if (!$.box.isActive()) return
	            if (event) event.preventDefault()
	            var current = getCurrent()
	            current.close()
	            return current.$elm
	        }
	        // Returns if there currently is an active modal
	    $.box.isActive = function() {
	        return boxs.length > 0
	    }
	    $.box.getCurrent = getCurrent
	    $.box.defaults = {
	            closeExisting: true,
	            escapeClose: true,
	            multiple: false,
	            closeClass: '',
	            modalClass: "box",
	            fadeDuration: null, // Number of milliseconds the fade animation takes.
	            fadeDelay: 1.0, // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
	            effect: 'slide' // https://jqueryui.com/show/
	        }
	        // Event constants
	    $.box.BEFORE_BLOCK = 'box:before-block'
	    $.box.BLOCK = 'box:block'
	    $.box.BEFORE_OPEN = 'box:before-open'
	    $.box.OPEN = 'box:open'
	    $.box.BEFORE_CLOSE = 'box:before-close'
	    $.box.CLOSE = 'box:close'
	    $.box.AFTER_CLOSE = 'box:after-close'

	    $.fn.box = function(options) {
	            if (this.length === 1) {
	                new $.box(this, options)
	            }
	            return this
	        }
	        // Automatically bind links with rel="modal:close" to, well, close the modal.
	    $(document).on('click.box', 'div[rel~="box:close"]', $.box.close)
	}))