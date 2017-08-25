/**
 * 
 * Класс Форм
 * 
 */
define(['jquery', './list', './root'], function($, listClass, rootClass){

    // unique string
    var fieldDataKey = 'reqresFormClass';
    
    var formclass = rootClass.extend({

        /**
         *
         * Дефолтные опции
         * 
         *
         */  
        options: {
            

        },

        /**
         *
         * Инициализация формы
         *
         */         
        init: function(options, elem) {

            var _this = this
            // инициалитзация запускается всегда
            this.options = $.extend({},this.options,options);

            // нужно проверять наличие
            
            // вспомогательные списки элементов
            this.lists = []

            // оживляем селектор кнопок сабмита
            if(this.options.button !== undefined)
                $(this.options.button).click(function(){ _this.submit() })              

            // Save the element reference, both as a jQuery
            // reference and a normal reference
            this.elem  = elem;
            this.$elem = $(elem);

            // в основном теге формы перечислены классы илементов являющихся полями для данной формы
            // а также перечислены модули (пути папок) для подгрузки оживителей этих полей
            
            // находим список классов которые находятся в этой форме
            this.fieldClassesPattern = (this.$elem.attr('data-field-class') || '').split(' ').join(', .')
            if(this.fieldClassesPattern.length > 0) this.fieldClassesPattern = '.' + this.fieldClassesPattern


            this.$elem.submit(function(){ 

                _this.submit()
                return false 

            })
            

        },

      
        /**
         *
         * Работаем с полямы формы
         * 
         * Поля обнаруживваются автоматически
         * Можно в виде строки передать поля и в функцию вернуться эти поля по списку,
         * Можно не указывать поля, тогда вернется список всех полей с ключами
         * Можно указать контекст (узел) в котором будут найдены поля
         *
         */         
        detect: function() {
			var ttt = arguments
            
            var _this = this

            var handlers = [], fields = [], node, last_element = false
            for(var j = 0; j < arguments.length; j++){
                
                // добавялем обработчик
                if(typeof arguments[j] == 'function') handlers.push(arguments[j])
                if(typeof arguments[j] == 'boolean') last_element = arguments[j]

                // перезаписываем элемент последним элементом
                //if(typeof arguments[j] == 'object' ) node = arguments[j]
                if(arguments[j] instanceof HTMLElement) node = arguments[j]
                if(arguments[j] instanceof jQuery) node = arguments[j]
                

                // перезаписываем поля последней строкой
                if(typeof arguments[j] == 'string') fields = arguments[j].split(' ')
                
            }
            
            if(!node) node = this.$elem

            // будующий список полей для обработчиков
            var args = []
            var allfields = []
            
            // будущий список всех типов элементов
            var list_keys = {}, list = [], i = 0

            // перебираем все найденные поля
            var $fields = $(node).find(this.fieldClassesPattern).each(function(){
                
                var type =  $(this).attr('data-field-module') + '/field-' + $(this).attr('jstype')

                // заносим его в специальный массив чтобы загрузить сразу
                if(type in list_keys) return
                list.push(type) 
                list_keys[type] = i++                
                
            })

            // подгрузив все типы полей
            require(list, function(){
                
                var classes = arguments
                
                // опять перебираем все поля
                $fields.each(function(){
                        
                    var type = $(this).attr('data-field-module') + '/field-' + $(this).attr('jstype')
                    // проверяем инициалоизировано ли поле
                    var Field = $(this).data(fieldDataKey)
                    // если нет
                    if(!Field){

                        // инициализируем
                        var field_class = classes[list_keys[type]]
                        Field = new field_class(this)            

                        $(this).data(fieldDataKey, Field)

                    }                

                    // получаем имя поля
                    var key = $(this).attr('name')

                    // получаем индекс поля в списке запрашиваемых
                    var ind = $.inArray(key, fields)

                    // добавляем в список всех полей
                    allfields.push([key, Field, key.slice(-2) == '[]' ? $(node).find(_this.fieldClassesPattern).filter('[name="'+key+'"]').index(this) : undefined ])  // _this.$elem
                    
                    // если есть список и в списке запрашиваемых его нет, то игноррируем
                    if(fields.length == 0) return
                    if(ind < 0) return                    

                    // если работаем с массивами
                    if(key.slice(-2) == '[]'){
                        
                        if(last_element){
                            
							args[ind] = Field

                        } else {
                            
                            if(!args[ind]) args[ind] = $()
                            args[ind] = args[ind].add(Field)
                            
                        }
                        
                        
                        
                    } else args[ind] = Field

                })

                
                
                // запускаем наши обработчики
                $.each(handlers, function(key, handler){
                    handler.apply(_this, (fields.length > 0) ? args : [allfields])
                })
                
            })
            
            return this
            
        },

        /**
         *
         * Перебираем все поля функцией
         * Аргумента три key, Field, index
         *
         */         
        fields: function(handler, context) {

            var _this = this
            var ii = 0
            
            this.detect(function(fields){
                

                $.each(fields, function(i, arr){

            		ii++
                    var key = arr[0]
                    var Field = arr[1]
                    var index = arr[2]
                    
                    handler.call(Field, key, Field, index, ii == fields.length)
                    
                })
                
            }, context)
                            
            return this
            
        },
        
        
        /**
         *
         * Ищем поле по ключу [и индексу]
         *
         */          
        fieldExists: function(key, index){
            
            // перебираем все найденные поля
            var $fields = this.$elem.find(this.fieldClassesPattern).filter('[name="'+key+'"]')
            return !index ? ($fields.length > 0) : ($fields.eq(index).length > 0)
            
        },
        

        /**
         *
         * Назначаем обработчик при изменеии полей
         *
         */         
        change: function() {

            var _this = this
            
            var handler, fields = [], immidiatly = false
            for(var j = 0; j < arguments.length; j++){
                
                if(typeof arguments[j] == 'function') handler = arguments[j]

                if(typeof arguments[j] == 'object') fields.push(arguments[j])

                if(arguments[j] === true) immidiatly = true
                
            }
            
            var LastField
            $.each(fields, function(i, Field){
                
                LastField = Field
                Field.change(function(e, val, oldval){
            
                    handler.call(_this, this, val, oldval)
                    
                })
                
            })
            
            if(immidiatly) LastField.change()

            return this
            
        },
        
        /**
         *
         * Добавляем возможности использовать "Списки"
         *
         */
        list: function(list){
            
            var _this = this

            if(!list instanceof listClass) return this

            // сохраняем экземпляр списка
            // переделать через !!! require
            _this.lists.push(list)
            
            return this
            
        },
        
        /**
         *
         * Выполняем обработчик формы
         *
         *
         */         
        submit: function(deferred){

            
            if(typeof deferred == 'function'){
                
                // добавляем обработчик
                $(this).on('onsubmit', function(e, def){

                    return deferred.call(def, def)

                })

                return this                
            }

            
            var _this = this

            var d // = $.Deferred().done(function(result){
            
            /*
                return $.ajax({

                    'type'      : _this.$elem.attr('method'),
                    'url'       : _this.$elem.attr('action'),
                    'data'      : result,
                    'dataType'  : 'json',
                    'context'   : _this,

                }).on('protocol.form', function(){
                    
                    console.log(arguments)
                    //return $(this).triggerHandler('onsubmit', [d])
                    
                })
              */  
                /*
                .on('protocol.form.success', function(e, Form, data, status, jqXHR){ 

                    
                    if('last_index' in data) {

                        //Form.submit(data.last_index)
                        // если к форме есть список, возвращаем элемент для выделения
                        //if('List' in Form) Form.List.action('activeByIndex', [data.last_index])

                    }

                })
                */
                /*
                .done(function(){

                    // выполняем обработчик из опций
                    if('submit' in _this.options)
                    	_this.options.submit.apply(_this, arguments)

                })
                */
                /*
                .done(function(data){

                    // это выполниться если протокол-формы успешно отработан
                    // и протокол вернет true
                    deferred.resolveWith(_this, arguments)
                    
                })
                */
                
            //})
            
            
            // перебираем все поля
            this.detect(function(fields){

                var result = []
                
                $.each(fields, function(i, arr){
                
                    var key = arr[0]
                    var value = arr[1].valueSystem()

                    // если значение undefined, значит не передаем его вообще
                    if(value === undefined) return

                    if(value === null){
                        result.push(key+'[null]=true')
                    } else {
                        result.push(key+'='+encodeURIComponent(value))  
                    }                    
                    
                })
              
				d = $.ajax({

                    'type'      : _this.$elem.attr('method'),
                    'url'       : _this.$elem.attr('action'),
                    'data'      : result.join('&'),
                    'dataType'  : 'json',
                    'context'   : _this,

                // если все четко
                }).on('protocolFormSuccess', function(){

                    // это выполниться если протокол-формы успешно отработан
                    // и протокол вернет true
                    if(deferred) deferred.resolveWith(_this, arguments)
                    
                })
                
                d = $(this).triggerHandler('onsubmit', [d])
                // выполняем аякс
                //d.resolve(result)
                

                
            })
            
            return d
            //return $(this).triggerHandler('onsubmit', [d])
            
        }, 

        /*

        object: function(object){
            
            if(!object) return this.objectClass
            this.objectClass = object
            
            return this
        },
        
        */
        
        /**
         *
         * Присваиваем значения
         * 
         *
         */         
        values: function(data){


            var _this = this  


            // перебираем все данные
            $.each(data, function(key, value){

                // если значение массив
                if(key.slice(-2) == '[]') {

                    var maxIndex = value.length

                    // если поле существует уходим
                    if(_this.fieldExists(key, maxIndex-1)) return

                    // находим к какому списку принадлежит поле
                    // перебираем все списки
                    $.each(_this.lists, function(k, list){

                        // ищем наше поле в шаблоне списка
                        if( $(_this.fieldClassesPattern, list.template()).filter('[name="'+key+'"]').length > 0){
							// создаем в спике указанное количество элементов                            
                            list.count(maxIndex)
                            
                        }

                    })

                }

            })

            this.fields(function(key, Field, index){

                //console.log(key, index)
                if(data[key] === undefined) return

                // если поле одинарное
                if(index === undefined) return this.val(data[key])

                if(data[key][index] === undefined) return

                this.val(data[key][index])
                
                
            })
           
        },    
        
        /**
         *
         * Показываем ошибки пришедшие
         * 
         *
         */         
        errors: function(data){

            this.fields(function(key, Field, index){

               
                // убираем ошибки со всех полей
                Field.errors(false)

                // если ошибки нет
                if(data[key] === undefined) return

                // если поле одинарное
                if(index === undefined) Field.errors(data[key])

                //Field.focus()
                if(data[key][index] === undefined) return

                Field.errors(data[key][index])

            })

        },


        /**
         *
         * Обнуляем значения формы
         * 
         *
         */     
        reset: function(errors){

            if(errors) this.errors(false)

            
            // перебираем все списки
            $.each(this.lists, function(key, list){
                
                // очищаем все списки
                list.remove(true)
                
            })
            
            this.fields(function(key, Field, index){

                Field.reset()

            })

        },

        /**/

    });

    
    // статичный метод
    formclass.around = function(){
        
        // получаем аргументы
        var args = arguments
        // без аргументов никак
        if(args.length == 0) return;
        
        // первым аргументом то вокруг чего ищем форму
        var context = args[0]
        // остальные аргументы как удобно
		args = Array.prototype.slice.call(args, 1)        
        
        // находим форму выше
        var $form = $(context)

        $form = $form.add($form.parents()).filter('form')

        if($form.length < 1) {
            alert('Не удалось найти и создать класс формы')
            return context
        }

        // ищем класс формы
        var Form = $form.data(fieldDataKey)
        // не нашли
        if(!Form){

            // объект не определен, поэтому ждем в первом аргументе настройки
            var options = args[0] == 'init' ? args[1] : {}
            // инициируем форму
            Form = new formclass(options, $form.get(0))
            $form.data(fieldDataKey, Form)
            
        }

        return Form

    }
        
    return formclass

})

