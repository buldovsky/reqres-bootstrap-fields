/**
 * 
 * Класс Полей
 * 
 */
define(['./root'], function(rootClass){
    
    return rootClass.extend({

        init: function(input){

            var _this = this

            this.input = input
            this.$input = $(input)
            
            
            // при изменении сообщаем
            this.$input.on('input', function(e){
            
                // сообщаем что мы изменились
                // но не меняем себя
                _this.change(false)
                
            })
            
            this.nullvalue = false
           
        },
        

        /**
         *
         * Устанавливаем/возвращаем значение (любое включая null)
         *
         * Именно устанавливаем извне при самонажатиях этот метод нигде не вызывается
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
            
            // устанавливаем значение через наследуемую функцию
            if(this._setValue(value) === false){
                
                alert('Не удалось установить значение в поле')
                console.log('Не удалось установить значение в поле', value)
				return
            }

            // при каждой установке значения мы пересохраняем приятное значение
            this._setPretty(this._getValuePretty(this._getValue()))
            
            // запускаем обработчик изменения
            // не факт, что она сработает
            this.change()

			return this
        },

        
        /**
         *
         * Либо добавляем обработчик события
         * Либо выполняем событие изменения
         *     если передать параметр true, событие будет инициировано даже если значение не изменилось
         *
         * Здесь мы использум именно системное значение
         * Так как например объекты сравнивать невозможно
         *
         */         
        change: function(arg){

            if(typeof arg !== 'function') {

                var newvalue = this.valueSystem()
                // если значение не поменялось, уходим
                // если конечно не установлино форсипровано изменить себя
                if((this.oldval === newvalue) && arg !== true) return this

                var oldval = this.oldval
                
                // значение поменялось, сохраняем новое
                this.oldval = newvalue
                
                // выполняем обработчик
                $(this).trigger('customchange', this._change( this.val(), oldval ) )  
                
                
            } else {
                
                $(this).on('customchange', arg)
                
            }
                
            return this
            
        },

        
        /**
         *
         * Получаем текстовое (HTML) значение
         *
         *
         */  
        valueSystem: function(){

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
         * Функция используется крайне редко чтолько в Multitype чтобы подменить текущее и предидущее значения
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
        _getValuePretty: function(val){
            
            return val //this._getValue()

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
         * Кроме установки значения эта функция еще выполняеь грубую проверку
         *
         */  
        _setValue: function(value){
            
            this.$input.val(value)
            
            //return value

        }, 
        
        /**
         *
         * Получаем текстовое (HTML) значение
         *
         *
         */  
        pretty: function(val){

            if(val === undefined) val = this._getValue()
            
            return this._getValuePretty(val)

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
         * Сбрасываем значение поля
         *
         *
         */  
        reset: function(){

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


            this.val('')

        }
        

    });


})

