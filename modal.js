/**
 * 
 * Класс модального окна
 *
 * Основной смысл объекта это работа со списком элементов этого объекта
 * 
 */
define(['jquery', 'reqres-classes/root'], function($, rootClass){
    
    
    /**
     *
     * Эта функция добавляет модалку в окно
     *
     * Все модалки (окна) будут храниться в элементе body с идентификатором modalContainerId
     * Каждая модалка (окно) будет привязана к контексту (DOM-элементу, который вызвал AJAX запрос)
     * В этом элементе и будет ссылка на модалку в data('objectmodal')
     *
     */

    var modalContainer
    var contextDataId = 'objectmodal'    
    
    return rootClass.extend({

        init: function(context, element){

            var _this = this
            
            this.$element = $(element)
            this.context = context
            
            // один раз только создаем контейнер
            if(!modalContainer) modalContainer = $('<div>').appendTo($('body'))
                
			// переносим модалку в контейнер
            this.$element.appendTo(modalContainer)
            
            // в контекст сохраняем себя
        	$(context).data(contextDataId, this)
            

                
            // все модалки одноразовые
            this.hide(function(){

                $(context).data(contextDataId, null)
                
                $(this).remove()

                modalContainer.children().last().trigger('refresh')

                
            })
            
            // выводим
            this.$element.modal('show')
            
        },
        
        /**
         *
         * 
         *
         */
        hide: function(handler){

            var _this = this

            // если нам нужно обещание события
            if(handler === 'deferred' || handler === 'promise'){
                
                // при выполнении обещания держим слово
                return $.Deferred().done(function(){ 
                    
                    // здесь мы получим аргументы которые передал нам Deferred
					// мы должны передать эти данные в нижестоящее модальное окно
                    
                    //console.log(arguments); 
                    
                    _this.hide() 
                    
                })
                
            }
                
            if(typeof handler == 'function'){
                
                this.$element.on('hidden.bs.modal', handler)
                return this
                
            }
            
            $(this.$element).modal('hide')

            return this
            
        },
        
        /**
         *
         * 
         *
         */
        refresh: function(handler){

            var _this = this
            
            // если нам нужно обещание события
            if(handler === 'deferred' || handler === 'promise'){
                
                // при выполнении обещания держим слово
                return $.Deferred().done(function(){ _this.refresh() })
                
            }

            if(typeof handler == 'function'){
                
                this.$element.on('refresh', handler)
                return  this
                
            }
            
            this.$element.trigger('refresh')

            return this
        },
        
        /**
         *
         * Возвращаем $ элемент - модальное окно
         *
         */
        get: function(){
           
            return this.$element
            
        },
        
        
    })
    
})
