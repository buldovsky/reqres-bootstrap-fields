/**
 * 
 * Класс Списков
 * 
 */
define(['jquery', 'reqres-classes/root'], function($, rootClass){
    
    return rootClass.extend({

        init: function(container, pattern, options){

            var _this = this
            
            this.container = container
            this.$container = $(container)
            this.pattern = pattern
            
            this.patterns = $.isArray(pattern) ? pattern : [pattern]
            
            this.$container.keyup(function(e){

                if(e.keyCode == 13 && e.ctrlKey) _this.add()
                if(e.keyCode == 46 && e.ctrlKey) _this.remove()
                if(e.keyCode == 38 && e.ctrlKey) _this.up()
                if(e.keyCode == 40 && e.ctrlKey) _this.down()

                e.stopPropagation()
                return false
                
            })
        
        },
        
        setActive: function(element){
        
            element.trigger(this.activeEvent)            
            return this
            
        },

        getActive: function(){
        
			return this.activeElement
            
        },
        
        setActiveHandler: function(handler){
        
            this.container.delegate(this.pattern, 'onactive', handler)
            return this
            
        },
        
        setActiveEvent: function(event){
            
            this.event = event
			return this
            
        },
        
		addPattern: function(pattern){
            
            this.patterns.push(pattern)
            
        },        
        

        
        
        /**
         *
         * Метод активации элементов
         *
         * Если есть обе переменные указываем тип активации
         * Если один только аргумент - элемент, проверяем является ли он активным
         * Если не ни одного аргумента, активируем пришедший элемент
         *
         */
        active: function(className, event){
            
            var _this = this

            // не указан тип события
            if(!event){
                
                // не указан класс - возвращаем активный элемент
                if(!className) return this.activeElement
                
                // в качестве className - элемент
                // активируем пришедший элемент
                className.trigger(_this.activeEvent)
                return className
                
            }
            
            _this.activeEvent = event
            this.container.delegate(this.pattern, event, function(){
            
                $(_this.activeElement).removeClass(className)
                
                $(this).addClass(className)

                _this.activeElement = this
                
            })
            
            return this
            
        },
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        // определяем шаблон для вставки
        template: function(pattern, o){
            
            var _this = this
            if(!pattern) return this.templateElement || null

            
            var t = this.container.find(this.pattern + pattern)
            
            if(t.length == 0) t = $(pattern)
            if(t.length == 0) console.log('Шаблон списка не найден')
            
            // клонируем шаблон
            this.templateElement = t.clone()
            // удаляем реальную строку
            t.remove()

            if(!o) var o = {}
			if('addbutton' in o) $(o.addbutton).click(function(){ _this.add() })
			if('removebutton' in o) $(o.removebutton).click(function(){ _this.remove() })
            
            return this
            
        },
        // добавляем элемент
        add: function(arg){
            
            var newelem = $()
            if(!arg) arg = 1

            // копируем заготовку
            if(typeof arg == 'number') for(var i=0; i<arg; i++) newelem = newelem.add(this.templateElement.clone().appendTo(this.container))

            // копируем текущий элемент
            if(arg === true){
            
                if('activeElement' in this) {
                    
                    newelem = $(this.activeElement).clone().insertAfter(this.activeElement)
                    this.active(newelem)
                    
                }
                
            }
            
            // выполняем обработчик вставки
            this.insert(newelem).order()
            
            return newelem
            
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
                
                var index = this.$container.find(this.pattern).index(arg)
                $(this).triggerHandler('insert', [arg, index])
                
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
                
                var index = this.$container.find(this.pattern).index(arg)
                $(this).triggerHandler('order', [arg, index])
                
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
            this.container.find(this.pattern).each(function(){
            
                handler.call(_this, $(this), i++)
                
            })
            return this
            
        },             
        
        // удаляем элемент
        remove: function(all){

            // удаляем активный
            if(!all){
                
                if('activeElement' in this) {
                    
                    $(this.activeElement).remove()
                    
                    // !!! активируем рядом стоящий элемент
                    
                }

            // удаляем все
            } else this.container.find(this.pattern).remove()
            
            this.order()
            
            return this
            
        },
        // поднимаем элемент
        up: function(){

            
            
        },
        // опускаем элемент
        down: function(){

            
            
        },
        // предидущий элемент
        prev: function(){

            
            
        },
        // следующий элемент
        next: function(){

            
            
        },
        // добавляем выполняем метод
        action: function(actionId, handler){

            if(!this.actions) this.actions = {}
            
            if(!handler){
                
                if(actionId in this.actions) this.actions[actionId].call(this)
                
            } else this.actions[actionId] = handler
                    
            return this
            
        },
        
        delegate: function(pattern, event, handler){
            
            var _this = this
            
            var patt = this.pattern
            
            if(!handler){
                handler = event
                event = pattern
            } else {
                patt = this.pattern + pattern                    
            } 

            // при возникновении события на элементе
            this.container.delegate(patt, event, function(){
                
                // выполняем обработчик
                handler.call(_this, $(this))

            })
            
            return this
            
        },
        
        get: function(pattern){
            
            return this.container.find(this.pattern + pattern)
            
        }
        
    })
})

