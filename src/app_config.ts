import _ from 'lodash'
const fromatMenue=(menue:any[],isFirst=true)=>{
      menue.forEach((item)=>{
        item.icon=!isFirst?'smile':"crown"
        item?.children?.length>0?fromatMenue(item?.children,false):null
    })
    return menue
}
export {
    fromatMenue
}
