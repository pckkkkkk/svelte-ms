export const createHashNavigation = (anchor) => {
    return {
        init: function() {
            window.addEventListener('hashchange', () => {
                const index = this.getLocationIndex()
                if(index > -1) {
                    this.move(index, true)
                }
            }, false);
            
            const index = this.getLocationIndex()
            if(index > -1) {
                setTimeout(() => {
                    this.move(index, true)
                }, 100)
            }
        },
        
        getLocationIndex: () =>  {
            const val = location.hash.split('#')[1]
            return anchor.indexOf(val)
        },
        
        afterScroll: function() {
            const hash = `${anchor[this.current]}`
            
            if(history.pushState) {
                history.pushState({}, hash, '#' + hash);
            } else {
                location.hash = hash
            }
        }
    }
}