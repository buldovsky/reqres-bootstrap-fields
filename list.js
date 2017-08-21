/**
 * 
 * Класс Списков
 * 
 */
define(['jquery', './root'], function($, rootClass){
    
    return rootClass.extend({

        init: function(container, options){

            var _this = this

            this.elementsCount = 0

            // дополнительные паттерны, которые в зависимости от 
            this.patterns = [] //$.isArray(pattern) ? pattern : [pattern]

            this.templateElement = null
            
            this.$container = $(container)
                .keydown(function(e){

                	var stop = false
                    
                    if(e.keyCode == 13 && e.ctrlKey) { _this.add(); stop = true }
                    if(e.keyCode == 46 && e.ctrlKey) { _this.remove(); stop = true }
                    if(e.keyCode == 38) { if(e.ctrlKey) _this.up(); else _this.active( _this.prev() ).scroll(); stop = true }
                    if(e.keyCode == 40) { if(e.ctrlKey) _this.down(); else _this.active( _this.next() ).scroll(); stop = true }

                	// если выполнено одно из условий игнорируем текущее нажатие
                    if(stop) {
                        e.stopPropagation()
                    	return false
                    }

                })

            
            if('patterns' in options){
                
                if('element' in options.patterns) this.pattern = options.patterns.element
                //if('search' in options.patterns) this.input = this.$container.find(options.patterns.search)
            }
            if('classes' in options)
                if('context' in options.classes) this.contextmenu(options.classes.context)
            
            this.input = this.$container.find('input')
            this.input.first().focus()
            
            // основной паттерн, все элементы должны быть в этом паттерне
            //this.pattern = pattern
        
        },
        
        
        /**
         *
         * Метод активации элементов
         *
         */
        activation: function(event, classname){
            
            var _this = this
            
            this.on(event, function(e){

                _this.active($(this))
                
            })
                
            if(typeof classname == 'string')
                this.on('activate', function(elem){ elem.addClass(classname) })
                	.on('deactivate', function(elem){ elem.removeClass(classname) })
            
            return this
            
        },

        /**
         *
         * Добавляем выполняем события при вставке
         *
         */
        active: function(arg){

            // возвращаем активный элемент
            if(!arg) return this.activeElement

            // если строка, то по строке находим элемент
            if(typeof arg == 'string') arg = this.index(arg)
            
            // добавляем обработчик активации
            if(typeof arg == 'function'){

	            var _this = this
                // добавляем обработчик
                this.on('onactive', function(){  arg.apply(_this, arguments)  })

	            return this
                
            }
            
			// устанавливаем активный элемент
            var lastActive = this.active()
            this.activeElement = $(arg)

            this.activeElement.trigger('onactive', [ $(arg), lastActive])
            
			//if(this.input) this.input.focus()

            return this
            
        },
        
        /**
         *
         * Пролистываем список на элемент !!!
         *
         * если передать deferred, то событие выполнится отложенно
         *
         */
        scroll: function(arg){

            var element = this.active(), happens = true
            
            if(typeof arg == 'object') {
                if('resolve' in arg) happens = arg
                else element = arg
            }

            $.when(happens).then(function(){

                if(!element) return
                // !!! должен быть правильный скролл
                element.parents('.modal:first').animate({ scrollTop: element.position().top - 30 }, 1000);

            })
            
            return this
            
        },
        
        /**
         *
         * Вешаем обработчик на все элементы
         *
         */
        on: function(event, handler){
          
            var _this = this
            this.$container.on(event, this.pattern, function(e){
                
                if(_this.patterns.length > 0) if($(this).filter(_this.patterns.join(',')).length == 0) return
                
                handler.apply($(this), arguments)
                
            })
            return this
            
        },        
        
        
        /**
         *
         * Добавляем еще один паттерн
         *
         */
		addPattern: function(pattern){
            
            this.patterns.push(pattern)
            return this
            
        },
        
        /**
         *
         * Удаляем паттерн !!!
         *
         */
		removePattern: function(pattern){
            
            // прописать удаление !!!
            return this
            
        },
        
        /**
         *
         * 
         *
         */
        get: function(pattern){
          
            var res = this.$container.find(this.pattern) 
            if(this.patterns.length) res = res.filter(this.patterns.join(','))
			return res
            
        },
     
        
        /**
         *
         *
         *
         */
        contextmenu: function(classes){
          
            var _this = this
                
            var context_menu = this.$container.find('.' + classes.single)

            this.$container.on('contextmenu', this.pattern, function(e){ return false })
            
            this.on('contextmenu', function(e){

                
                // сначала генерируем событие нажатия на элементе
                var event = $.Event("click")
                event.ctrlKey = e.ctrlKey
                event.fromcontextmenu = true
                $(this).trigger(event)


                context_menu = _this.$container.find('.' + classes.single)

                //if(!context_menu.length)
                
                //!!! доделать
                //if(_this.active) if(_this.active.length > 1) context_menu = _this.$container.find('.' + classes.multi)

                var bd = 10, left = e.pageX , top = e.pageY, xx = 0, yy = 0
                $(this).parents().each(function(){
                    //xx += $(this).scrollLeft()
                    yy += $(this).scrollTop()
                })
                
                var leftg = $(window).width()+ xx - context_menu.outerWidth() -bd
                var topg = $(window).height()+ yy - context_menu.outerHeight() -bd


                if(left > leftg) left = leftg
                if(top > topg) top = topg

                
                var parentElement = context_menu.parent()
                // при следующем клике будем скрывать контекстное меню
                $(document).one('click', { context: context_menu.get() },  function(e){ 
                    $(e.data.context).hide(); 
                    context_menu.appendTo(parentElement) 
                })

                context_menu
                	.appendTo('body')
                	// показываем меню
                    .show(100)
                	// там где кликнули
                    .css({ 'z-index':999999, position: "absolute", left: left, top: top })


            }).on('dblclick', function(e){
            
                var res = _this.select(this)
                if(res) return
                
                if(!context_menu.length) context_menu = _this.$container.find('.' + classes.single)

                // если у нас указан жирный элемент
                // кликаем на него
                if($('b:first', context_menu).length) return $('b:first', context_menu).click()

                // либо просто открываем контекстное меню
                e.type = 'contextmenu'
                $(this).trigger(e)

            
			})
                            
            return this
            
        },
        
        // определяем шаблон для вставки
        template: function(pattern){
            
            var _this = this

            if(!pattern) return this.templateElement
            
            //var t = this.container.find(this.pattern + pattern)
            var t = this.get().find(pattern)
            
            if(t.length == 0) t = $(pattern)
            if(t.length == 0) {
                alert('Шаблон списка не найден ' + pattern)
                return
            }
            
            // клонируем шаблон
            this.templateElement = t.clone()
            // удаляем реальную строку
            t.remove()
            
            return this
            
        },
        
        // добавляем элемент
        add: function(num){

            if(!num) num = 1

            // копируем текущий элемент
            if(num === true){
            
                if(this.active().length == 0) return this

                var newelem = this.active().clone().insertAfter(this.active())
                
            } else {

	            var newelem = $()
                if(typeof num == 'number') for(var i=0; i<num; i++) {

                    newelem = newelem.add( this.templateElement.clone().appendTo(this.$container) )
                    
               } else {
                   alert('При добавлении строки передан неверный параметр')
                   return
               }
                
            }

            this.active(newelem.last())
            
            //this.elementsCount = this.container.find(this.pattern).length
            this.elementsCount = this.get().length
                
            // выполняем обработчик вставки
            this.insert(newelem).order(true)
            
            return this
            //return newelem
            
        },
        
        /**
         *
         * Доводим количество элементов к необходимому количеству
         *
         * бывший make
         *
         */
        count: function(count){
            
            if(this.elementsCount === count) return this
            // элементов слишком много
            if(this.elementsCount > count) this.remove(this.elementsCount - count)
            // элементов слишком мало
			else this.add(count - this.elementsCount)
                
            return this
            
        },
        
        /**
         *
         * Добавляем выполняем события при вставке
         *
         */
        insert: function(arg){
        
            if(typeof arg == 'function') {

                $(this).on('insert', arg)
                
            } else {
                
                var index = this.get().index(arg)
                //var index = this.$container.find(this.pattern).index(arg)
                $(this).triggerHandler('insert', [arg, index])
                
            }
            
            return this
            
        },
        
        select: function(arg){
            
            if(typeof arg == 'function') {

                $(this).on('select', arg)
                
            } else {
                
                return $(this).triggerHandler('select', [arg])
                
            }
            
            return this
            
        },
        
        /**
         *
         * Добавляем выполняем события при вставке
         *
         */
        order: function(arg){
        
            if(typeof arg == 'function') {

                $(this).on('order', arg)
                
            } else {
                
                var index = this.get().index(arg)
                //var index = this.$container.find(this.pattern).index(arg)
                $(this).triggerHandler('order', [arg, index])
                
            }
            
            return this
            
        },

        /**
         *
         * Добавляем выполняем события обновления
         *
         */
        refresh: function(arg, one){
        
            var defs = []
            if(typeof arg == 'object')
                if('resolve' in arg && 'then' in arg){
                    defs.push(arg) 
                    return this
                }
                   
                
            if(typeof arg == 'function') {
		
                // обработчик может назначаться на все время либо только на 1 раз
                if(!one) $(this).on('refresh', arg); else $(this).one('refresh', arg)
                
            } else {
                
                var _this = this
                $.when.apply($, defs).then(function(){
                
                    $(_this).triggerHandler('refresh', arguments)
                    
                })
                
                
            }
            
            return this
            
        },

        
        /**
         *
         *
         *
         */
        each: function(handler){
        
            var _this = this
            
            var i = 0
            
            
            //this.container.find(this.pattern).each(function(){
            this.get().each(function(){
            
                handler.call(_this, $(this), i++)
                
            })
            return this
            
        },             
        
        // удаляем элемент
        remove: function(arg){

            // удаляем активный
            if(!arg){
                
                if(this.active().length > 0) {
                    
                    var ind = this.index()
                    this.active().remove()
                    // активируем рядом стоящий элемент
					if(ind >= this.elementsCount -1) ind--
                    this.active(this.index(ind))
                    
                }

            } 
            
            // удаляем все            
            if(arg === true) this.get().remove()
            if(typeof arg == "number") this.get().slice(0, arg).remove()
            
            this.elementsCount = this.get().length
            /*
            if(arg === true) this.container.find(this.pattern).remove()
            if(typeof arg == "number") this.container.find(this.pattern).slice(0, arg).remove()
            
            this.elementsCount = this.container.find(this.pattern).length
            */
            this.order(true)
            
            return this
            
        },
        
        

        /**
         *
         * унаем порядковый номер элемента или активного элемента
         *
         */
        index: function(elem){
            // есмли пришло число
            if(typeof elem == "number") return this.get().eq(elem)

			if(typeof elem == 'function'){
                // сохраняем обработчик
                this.indexHandler = elem
                return this
            }
            
            if(typeof elem == 'string'){
                // если нет функции уходим
                if(!this.indexHandler) return
                // нкцию поиска элемента по уникальному индексу
                return this.indexHandler.call(this, elem)
            }
            
            if(!elem) elem = this.active()
            if(!elem) return false
            
            
            return this.get().index(elem)
            
        },
        
        // поднимаем элемент
        up: function(elem){

            if(!elem) elem = this.active()
            if(!elem) return this
            
            var prev = this.prev()
            if(this.index(elem) == 0) return

            $(elem).insertBefore(prev)
            
            this.order(false)
            
            return this
            
        },
        // опускаем элемент
        down: function(elem){

            if(!elem) elem = this.active()
            if(!elem) return this
            
            var next = this.next()
            if(!next) return
            
            $(elem).insertAfter(next)
            
            this.order(false)
            
            return this
             
        },
        // предидущий элемент
        prev: function(elem){

            if(!elem) elem = this.active()
            if(!elem) return this

            return this.index( this.index(elem) -1)
            
            
        },
        // следующий элемент
        next: function(elem){

            if(!elem) elem = this.active()
            if(!elem) return this
            
            return this.index( this.index(elem) +1)
            
        },
        // добавляем выполняем метод
        action: function(actionId, handler){

            if(!this.actions) this.actions = {}
            
            if($.isArray(handler) || !handler){
                
                if(actionId in this.actions) this.actions[actionId].call(this, handler)
                
            } else this.actions[actionId] = handler
                    
            return this
            
        },

        
        /**
         *
         * Возвращаем id текущего элемента
         *
         * /
        rid: function(index){
            
            //return Math.random() >= 0.5;    
            
            if(!index) {
                
                return this.active().length > 1
                    ? this.active().map(function(){ return $(this).data('rid') || '' }).get() 
                	: this.active().data('rid') || ''
                
            }
            
            if(typeof index == 'number')
                //return this.$element.find('.' + this.pattern).eq( index ).data('rid') || ''
                return this.get().eq( index ).data('rid') || ''

            return $(index).data('rid') || ''
                
        },
        
        /**/
        
    })
})

