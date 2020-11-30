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
            try {
                const val = location.hash.split('#')[1]
                return anchor.indexOf(val)
            } catch {
                return -1
            }
        },
        
        afterScroll: function() {
            if(typeof anchor[this.current] !== 'undefined') {
                location.hash = anchor[this.current]
            }
        }
    }
}