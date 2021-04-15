class Vec3 {
    constructor(x, y, z){
        this.x = x
        this.y = y
        this.z = z
    }

    min(){
        return Math.min(this.x, this.y , this.z)
    }

    mid(){
        let vecArray = [this.x, this.y, this.z]
        vecArray.sort()
        return vecArray[1]
    }

    max(){
        return Math.max(this.x, this.y, this.z)
    }

    sumSq(){
        let sum = this.x ** 2 + this.y ** 2 + this.z ** 2
        return sum
    }
}