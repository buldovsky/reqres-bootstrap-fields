/**
 * 
 * Класс объекта
 *
 * Основной смысл объекта это работа со списком элементов этого объекта
 * 
 */
define(['jquery', 'reqres-classes/root', 'reqres-classes/field', 'reqres-classes/modal'], function($, rootClass, fieldClass, modalClass){
    
    return rootClass.extend({

        init: function(element, options){

            var _this = this

            //console.log(element, options)
            
            this.options = options
            this.element = element
            this.$element = $(element)
            
            this.request = {}
            
            $.each(options.requests, function(key, url){

                _this.request[key] = (function(url){ 
                    
                    return function(args, context){

                        return $.ajax({

                            url: url.replace(/\[\:([a-z0-9_-]+)\]/g, function(found, val){
                                if(val in options) return options[val]
                                return (val in args) ? args[val] : found
                            }),
                            // передаем протокол в контекст
                            context: !context ? _this : context

                        })          

                    } 
                
                })(url)
                                
                
            })
            
			if('ierarhy' in options) this.ierarhy(options.ierarhy)
            
                 
            
            
            // при нажати на элемент
            // делаем его активным
            this.$element.delegate('.' + this.getClass('element_class'), 'click', function(e){
            
                $('.' + _this.getClass('element_class') + '.active', _this.$element).removeClass('active')
                $(this).addClass('active')
                
                _this.active = this

            })
            

            // контекстное меню
            if(_this.getClass('context_class')){

                
                var context_menu = _this.$element.find('.' + _this.getClass('context_class'))

                // make sure menu closes on any click
                this.$element.on('click.xxx', function () { context_menu.hide(); });
                
                this.$element.delegate('.' + this.getClass('element_class'), 'contextmenu', function(e){

                    if(!context_menu.length) context_menu = _this.$element.find('.' + _this.getClass('context_class'))
                        
                    // return native menu if pressing control
                    if(e.ctrlKey) return;

                    $(this).click()
                    
                    _this.$element.trigger('click.xxx')
                    var bd = 10
                    
                    var left = e.clientX + _this.$element.scrollLeft()
                    var leftg = $(window).width()+ _this.$element.scrollLeft() - context_menu.outerWidth() -bd
                    if(left > leftg) left = leftg

                    var top = e.clientY + _this.$element.scrollTop()
                    var topg = $(window).height()+ _this.$element.scrollTop() - context_menu.outerHeight() -bd
                    if(top > topg) top = topg


                    context_menu
                        // показываем меню
                        .show(100)
                        // там где кликнули
                        .css({ 'z-index':999999, position: "absolute", left: left, top: top })


                    return false

                })            
                
                
                // двойное нажатие
                this.$element.delegate('.' + _this.getClass('element_class'), 'dblclick', function(e){
                    
                    // возвращаем значение в поле
                    if(_this.field instanceof fieldClass){
                        
                        // возвращаем массив с кодированным и текстовым значением
                        _this.field.val([_this.rid(), $(this).data('rtext')])
                        // закрываем модалочку
                        if(_this.modal) _this.modal.hide()
                        
                        return
                    }
                    
                    // определяем поле по которому кликнули
                    _this.activeField($(e.target).add($(e.target).parentsUntil('.' + _this.getClass('element_class'))).filter('[data-field]').first().attr('data-field'))
                    
                    if(!context_menu.length) context_menu = _this.$element.find('.' + _this.getClass('context_class'))
                    
                    // если у нас указан жирный элемент
                    if($('b,strong:first', context_menu).length) return $('b', context_menu).click()

                    // открываем контекстное меню
                    e.type = 'contextmenu'
                    $(this).trigger(e)

                    
                })                   
                
            }


            
        },

        /**
         *
         * Получаем или устанавливаем активную строку (данные строки) в глобальный скоп контролера
         *
         * /
        request: function(){
            

            
        },
        
        /**
         *
         * Получаем или устанавливаем активную строку (данные строки) в глобальный скоп контролера
         *
         */
        row: function(row){
            
            if(!row) return this.$objscope.row
            
            this.$objscope.row = row
            return this
            
        },
                            
        /**
         *
         * Мы запоминаем не только активную строку, но и активное поле
         *
         */
        activeField: function(activeFieldIndex){
          
            if(!activeFieldIndex) return this.activeFieldIndex
            
            this.activeFieldIndex = activeFieldIndex
            
            return this
            
        },
        
        /**
         *
         * Возвращаем класс чего-либо (контекста объекта или элемента объекта
         *
         */
        getClass: function(name){
          
            return this.options.classes[name]
            
        },
        
        /**
         *
         * Сообщаем объекту, что оно появилось благодаря полю, которому нужно вернуть элемент
         * 
         * Также сохраняем ему модальное окно, если оно есть
         *
         */
        setField: function(field, modal){
          
            if(field instanceof fieldClass) this.field = field
                
            if(modal instanceof modalClass) this.modal = modal
                
            return this
            
        },
        

        /**
         *
         * Смотрим существует ли поле для возврата в него значения этого объекта
         *
         */
        fieldExists : function(){
            
            return (this.field instanceof fieldClass)
            
        }, 
        
        /**
         *
         * Прописываем настройки иерархии в объекте
         *
         */
        ierarhy : function(options){
            
            this.ierarhy_options = options
            
            return this

        },  
        
        /**
         *
         * Получаем список дочерних элементов в иерархическом объекте исходя из настроек
         *
         */
        getChildren: function(rows, element, length){

            var _this = this
            var ioptions = this.ierarhy_options

            switch(ioptions.type){
                case 'al' :

                    var x = false
                    var res = {}
                    $.each(rows, function(rid, row){

                        var id = (element === undefined || element[ioptions.id] === ioptions.root_value) ? null : element[ioptions.id] 
                        if(row.parent_id !== id) return 
                        res[rid] = row
                        x = true

                    })

                    if(length) return x
                    return res

                break
            }

        },

        
        /**
         *
         * Возвращаем id текущего элемента
         *
         */
        rid: function(index){
            
            if(!index) 
                return $(this.active).data('rid') || ''
            
            if(typeof index == 'number')
                return this.$element.find('.' + this.getClass('element_class')).eq( index ).data('rid') || ''

            return $(index).data('rid') || ''
                
        },
        
        /**
         *
         * Возвращаем выбранный элемент
         *
         */
        select : function(){

            if(!this.fieldExists()) return
            $(this.active).dblclick()
            
        },
        
        
        
        
        
        
        
        
        
        /**
         *
         * 
         *
         */
        activeIndex : function(){
            
            return this.$element.find('.' + this.getClass('element_class')).index( this.active )

        },                                            
        
        
        /**
         *
         * 
         *
         * 
        prev : function(){
            
            //var elem = this.$element.find('.' + this.options.element_class)
            //.eq( this.activeIndex() -1 ).index() // ||  this.$element.find('.' + this.options.element_class).last()
            
            return this.activeIndex() -1
            
            //return elem

        },
        
        /**
         *
         * 
         *
         * 
        next : function(){
            
            //var elem = this.$element.find('.' + this.options.element_class)
            //.eq( this.activeIndex() +1 ).index() ||  this.$element.find('.' + this.options.element_class).first()
            return this.activeIndex() +1
            
            //return elem

        },
        /**/

        
        
    })
    
})
