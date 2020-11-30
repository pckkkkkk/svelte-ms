export const createHashNavigation = (anchor) => {
    let handler
    
    return {
        init: function() {
            handler =  this.hashchange.bind(this)
            window.addEventListener('hashchange', handler, false)
            
            const index = this.getLocationIndex()
            if(index > -1) {
                setTimeout(() => {
                    this.move(index, true)
                }, 100)
            }
        },
        
        hashchange: function () {
            const index = this.getLocationIndex()

            if(index > -1) {
                this.move(index, true)
            }
        },
        
        destroy: function() {
            window.removeEventListener("hashchange", handler)
        },
        
        getLocationIndex: () =>  {
            const val = location.hash.split('#')[1]
            return anchor.indexOf(val)
        },
        
        afterScroll: function() {
            const hash = anchor[this.current]
            
            if(history.pushState) {
                history.pushState({}, hash, '#' + hash);
            } else {
                location.hash = hash
            }
        }
    }
}