/**
 * 
 * Класс Полей
 * 
 */
define(['reqres-classes/root'], function(rootClass){
    
    return rootClass.extend({

        init: function(input){

            var _this = this

            this.input = input
            this.$input = $(input)
            
            // при изменении сообщаем
            this.$input.on('input', function(e){
            
                _this.change()
                
            })

            this.nullvalue = false

           
        },
        

        /**
         *
         * Устанавливаем/возвращаем значение (любое включая null)
         *
         *
         */  
        val: function(value){

            
            // присваиваем null
            if(value === null) {
                
                if(!this.isNull()) this.setNull().change()
                return this
                
            }
            // возвращаем значение
            if(value === undefined) {
                if(this.isNull()) return null
                if(this._getValue() === undefined) {
                    if(this._isNullable()) return null;
                    return undefined
                }
                return this._getValue()
            }
            // присваиваем не null точно
            if(this._isNullable()) {

                if(this.isNull()) this.unsetNull().change()
                
            }
            
            var oldval = this.val()
            // устанавливаем значение через наследуемую функцию
            this._setValue(value)
            
            this.change()
            
            this._setPretty(this._getValuePretty())

			return this
        },

        /**
         *
         * Получаем текстовое (HTML) значение
         *
         *
         */  
        pretty: function(){

            this.val( this.val() )
            return this._getPretty()

        },

        /**
         *
         * 
         *
         *
         */  
        to: function(elem){

            elem.html( this.pretty() )
            return this

        },
        
        /**
         *
         * Соединяем поле с текстовым элементом
         *
         */  
        connect: function(elem){

            this.change(function(){
                
            	elem.html( this.pretty() )                
                
            })
            
            return this

        },
        
        /**
         *
         * Получаем текстовое (HTML) значение
         *
         *
         */  
        systemValue: function(){

            // если у нас значение Null возвращаем null
            if(this.isNull()) return null
            // если значение не установлено
            if(this._getValueSystem() === undefined) {
                // если нуль допускается то устанавливаем его
                if(this._isNullable()) return null;
                return undefined
            }
            return this._getValueSystem()

        },
        
        /**
         *
         * Сбрасываем значение поля
         *
         *
         */  
        reset: function(){

            this.val('')
            this._reset()

            if(this._isNullable()) this.val(null)
            
            return this
        },

        /**
         *
         * Устанавливаем/Снимаем ошибку
         *
         *
         */  
        errors: function(errors){
            
            if(errors === false) {

                if(this.hasErrors()) this._removeErrors()

            } else {

                this._setErrors(errors)
                this.readonly(false)

            }
            return this

        },
        
        /**
         *
         * Устанавливаем/Снимаем блокировку
         *
         *
         */  
        disabled: function(value){
            
            if(value === false) {

                this._removeDisabled()

            } else {

                this._setDisabled()

            }
            return this

        },
        
        /**
         *
         * Устанавливаем/Снимаем блокировку
         *
         *
         */  
        readonly: function(value){
            

            if(value === false) {

                this._removeReadonly()

            } else {

                var value = (this.nullvalue === true) ? '' : this._getValuePretty()

                this._setReadonly(value)

            }
            return this
        },
        
        /**
         *
         * Фокусируем окно
         *
         *
         */  
        mainInput: function(input){
            
            if(input === undefined) return !this.$mainInput ? this.$input : this.$mainInput
            
            this.$mainInput = input
            return this
            
        },
        
        /**
         *
         * Фокусируем окно
         *
         *
         */  
        data: function(key, val){

            if(val === undefined) return 100
            return this
            
        },

        
        /**
         *
         * Фокусируем окно
         *
         *
         */  
        focus: function(){
            
            this.mainInput().focus()
            return this
            
        },

        /**
         *
         * 
         *
         *
         */  
        select: function(){
            
            this.mainInput().select()
            return this
            
        },
        
        /**
         *
         * 
         *
         *
         */         
        isNull: function(){
            
            return this.nullvalue ? true : false

        },

        /**
         *
         * 
         *
         *
         */         
        setNull: function(){
            
            if(!this._isNullable()) return this
            this.nullvalue = true
			this._setNull()            
           
            return this            

        },          

        /**
         *
         * 
         *
         *
         */         
        unsetNull: function(){

            if(!this._isNullable()) return this
            this.nullvalue = false
			this._unsetNull()            
            
            return this
            
        },

        /**
         *
         * Либо добавляем обработчик события
         * Либо выполняем событие изменения
         *     если передать параметр true, событие будет инициировано даже если значение не изменилось
         *
         */         
        change: function(handler){

            if(typeof handler !== 'function') {
            
                // если значение не поменялось, уходим
                if(this.oldval === this.systemValue() && handler !== true) return this
                
                var oldval = this.oldval
                
                // значение поменялось, сохраняем новое
                this.oldval = this.systemValue()
                
                // выполняем обработчик
                $(this).trigger('customchange', this._change( this.val(), oldval ) )  
                
                
            } else {
                
                $(this).on('customchange', handler)
                
            }
                
            return this
            
        },

        /**
         *
         * Возвращаем текущее значение
         *
         *
         */         
        _change: function(val, oldval){

            return [val, oldval]
            
        },

        
        /**
         *
         * Возвращаем текущее значение
         *
         *
         */  
        _getValue: function(){
            
            return this.$input.val()

        },

        /**
         *
         * Возвращаем текущее значение в читемом виде HTML
         *
         *
         */  
        _getValuePretty: function(){
            
            return this._getValue()

        },

        /**
         *
         * Возвращаем текущее значение для передачи в строку
         *
         *
         */  
        _getValueSystem: function(){
            
            return this._getValue()

        },
        
        /**
         *
         * Устанавливаем текущее значение (без null)
         *
         *
         */  
        _setValue: function(value){
            
            this.$input.val(value)
            
            return value

        }, 

        /**
         *
         * Устанавливаем ошибку
         *
         *
         */  
        _setErrors: function(errors){


        },          

        /**
         *
         * Снимаем ошибку
         *
         *
         */  
        _removeErrors: function(){
            

        },  

        /**
         *
         * Проверяем есть ли ошибки
         *
         *
         */  
        hasErrors: function(){

            
        },  

        /**
         *
         * Устанавливаем блокировку
         *
         *
         */  
        _setDisabled: function(){
            


        },          

        /**
         *
         * Снимаем блокировку
         *
         *
         */  
        _removeDisabled: function(){
            

        },  

        
        /**
         *
         * 
         *
         */  
        _getPretty: function(){


            
        },

        /**
         *
         * 
         *
         */  
        _setPretty: function(value){


            
        },        

        /**
         *
         * Устанавливаем только чтение
         *
         *
         */  
        _setReadonly: function(value){
            

        },          

        /**
         *
         * Снимаем только чтение
         *
         *
         */  
        _removeReadonly: function(){
            

        },
        
        /**
         *
         * 
         *
         *
         */  
        _reset: function(){



        }
        

    });

})

