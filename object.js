/**
 * 
 * Класс объекта
 *
 * Основной смысл объекта это работа со списком элементов этого объекта
 * 
 */
define(['jquery', './root', './field', './modal'], function($, rootClass, fieldClass, modalClass){
    
    return rootClass.extend({

        init: function(element, options){

            var _this = this

            //console.log(element, options)
            
            this.options = options
            this.element = element
            this.$element = $(element)
            
            this.requests = options.requests
            
            
			if('ierarhy' in options) this.ierarhy(options.ierarhy)
            
                 

                        /*
                        // при нажати на элемент
                        // делаем его активным
                        this.$element.delegate('.' + this.getClass('element_class'), 'click', function(e){

                            // если контрол не нажал
                            if(!e.ctrlKey){

                                // снимаем активацию с прежнего элемента
                                $('.' + _this.getClass('element_class') + '.active', _this.$element).removeClass('active')
                                // активируем новый
                                $(this).addClass('active')

                            } else {

                                // если мы пришли не через контекстное меню
                                if($(this).hasClass('active') && !e.fromcontextmenu) $(this).removeClass('active')
                                else $(this).addClass('active')

                            }


                            // сохраняем индекс и событие
                            _this.ind($(this).attr('data-ind'), e)

                            _this.active = $('.' + _this.getClass('element_class') + '.active', _this.$element)

                            // активируем поле поиска
                            _this.$element.find('.' + _this.getClass('search_class')).focus()                

                            //_this.active = this

                        })
                        */


            
            
            
            
            /*
            // контекстное меню
            if(_this.getClass('search_class')){
                
                setTimeout(function(){
                
					_this.$element.find('.' + _this.getClass('search_class')).focus()

                }, 500)
                
                
            }
            */
            
                        /*
                        // контекстное меню
                        if(_this.getClass('context_class').single){

                            var context_menu = _this.$element.find('.' + _this.getClass('context_class').single)

                            // make sure menu closes on any click
                            //this.$element.on('click.xxx', function(e, context_menu_elem) { alert($(context_menu_elem).length); $(context_menu_elem).hide(); });

                            this.$element.delegate('.' + this.getClass('element_class'), 'contextmenu', function(e){

                                //if(!context_menu.length) 

                                //console.log(context_menu)
                                // return native menu if pressing control
                                //if(e.ctrlKey) return;

                                //_this.$element.trigger('click.xxx', [ context_menu.get() ])


                                // сначала генерируем событие нажатия на элементе
                                var event = $.Event("click")
                                event.ctrlKey = e.ctrlKey
                                event.fromcontextmenu = true
                                $(this).trigger(event)


                                context_menu = _this.$element.find('.' + _this.getClass('context_class').single)
                                if(_this.active) if(_this.active.length > 1) context_menu = _this.$element.find('.' + _this.getClass('context_class').multi)


                                var bd = 10

                                var left = e.clientX + _this.$element.scrollLeft()
                                var leftg = $(window).width()+ _this.$element.scrollLeft() - context_menu.outerWidth() -bd
                                if(left > leftg) left = leftg

                                var top = e.clientY + _this.$element.scrollTop()
                                var topg = $(window).height()+ _this.$element.scrollTop() - context_menu.outerHeight() -bd
                                if(top > topg) top = topg


                                // при следующем клике будем скрывать контекстное меню
                                $(document).one('click', { context: context_menu.get() },  function(e){ $(e.data.context).hide() })

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
                                    //_this.field.val([_this.rid(), $(this).data('text')])
                                    _this.field.val(_this.row())
                                    // закрываем модалочку
                                    if(_this.modal) _this.modal.hide()

                                    return
                                }

                                // определяем поле по которому кликнули
                                _this.activeField($(e.target).add($(e.target).parentsUntil('.' + _this.getClass('element_class'))).filter('[data-field]').first().attr('data-field'))

                                if(!context_menu.length) context_menu = _this.$element.find('.' + _this.getClass('context_class').single)

                                // если у нас указан жирный элемент
                                if($('b,strong:first', context_menu).length) return $('b', context_menu).click()

                                // открываем контекстное меню
                                e.type = 'contextmenu'
                                $(this).trigger(e)

                            })                   

                        }
                        */

            
        },


        /**
         *
         * Получаем или устанавливаем список
         *
         * /
        listClass: function(list){
            
            if(!list) return this.list
            
            this.list = list

            return this
            
        },
        
        /**
         *
         * Получаем или устанавливаем активную строку (данные строки) в глобальный скоп контролера
         *
         * /
        row: function(row, e){
            
            if(!row) return this.$objscope.activeRow
            
            this.$objscope.activeRow = row
            
            return this
            
        },
             
        /**
         *
         * Мы запоминаем не только активную строку, но и активное поле
         *
         * /
        activeField: function(activeFieldIndex){
          
            if(!activeFieldIndex) return this.activeFieldIndex
            
            this.activeFieldIndex = activeFieldIndex
            
            return this
            
        },
        
        /**
         *
         * Возвращаем класс чего-либо (контекста объекта или элемента объекта
         *
         * /
        getClass: function(name){
          
            return this.options.classes[name]
            
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
                    $.each(rows, function(rid, row1){

                        var id = (element === undefined || element[ioptions.id] === ioptions.root_value) ? null : element[ioptions.id] 
                        if(row1.parent_id !== id) return 
                        res[rid] = row1
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
        //rid: function(index){
            

            //return this.list.rid(index)
            
            /*
            if(!index) {
                
                return this.active.length > 1 ? this.active.map(function(){ return $(this).data('rid') || '' }).get() : $(this.active).data('rid') || ''
                
            }
            
            if(typeof index == 'number')
                return this.$element.find('.' + this.getClass('element_class')).eq( index ).data('rid') || ''

            return $(index).data('rid') || ''
             */   
        //},
        
        
        /**
         *
         * 
         *
         * /
        ind: function(index, event){

            if(!index) return this.rowInd

            this.rowInd = index
            this.rowIndEvent = event
            
            return this
                
        },
        
        /**
         *
         * 
         *
         * /
        activate : function(){


            var element = this.$element.find('.' + this.getClass('element_class') + '[data-ind='+this.ind()+']')
            
            if(!this.rowIndEvent){
                
                element.parents('.modal:first').animate({ scrollTop: element.offset().top - 30 }, "slow");
                
            }
            
            element.click()
			return this
            
        },
        
        /**
         *
         * Возвращаем выбранный элемент
         *
         * Проокеиваем элемент
         *
         */
        select : function(){

            if(!this.fieldExists()) return
            
            if(this.active.length > 1) { alert('Нельзя вернуть несколько строк'); return }
            
            $(this.active).dblclick()
            
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
                
        /**/
        
    })
    
})
