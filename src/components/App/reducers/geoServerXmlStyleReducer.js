// styles constants
const WORKSPACE = __WORKSPACE__
const ENDPOINT = __API__
const ICON_SIZE      = { x: 27,  y: 20  }
const THUMB_SIZE     = { x: 225, y: 150 }
const TOOLTIP_SIZE   = 750
const PROJECTION     = 'EPSG:3857'
const ICON_THUMB_URL = './resources/img/plataforma/icones/'

/**
 * Returns bounding box for a given layer
 * @param xmlNode XML node with a GeoServer layer
 * @return {String} bounding box string: minX,minY,maxX,maxY
 */
export const parseBoundingBox = (xmlNode) => {
    let boundingBox = xmlNode.getElementsByTagName('BoundingBox')[0]

    let minX = boundingBox.attributes.minx.value
    let minY = boundingBox.attributes.miny.value
    let maxX = boundingBox.attributes.maxx.value
    let maxY = boundingBox.attributes.maxy.value

    return `${minX},${minY},${maxX},${maxY}`
}

/**
 * Returns styles array
 * @param xmlNode XML node with a GeoServer layer
 * @param layer object with parsed layer data
 * @return {Object[]} Styles array
 */
export const parseStyle = (xmlNode, layer) => {
    let styles = []
    const styleCollection = xmlNode.getElementsByTagName('Style')

    for (let i=0, l=styleCollection.length; i<l; i++) {
        let style = styleCollection[i]

        let nameTags       = style.getElementsByTagName('Name')
        let titleTags      = style.getElementsByTagName('Title')
        let abstractTags   = style.getElementsByTagName('Abstract')
        let legendURLTags  = style.getElementsByTagName('LegendURL')

        let styleName      = nameTags.length      ? nameTags[0].textContent      : ''
        let styleTitle     = titleTags.length     ? titleTags[0].textContent     : ''
        let styleAbstract  = abstractTags.length  ? abstractTags[0].textContent  : ''
        let styleLegendURL = legendURLTags.length ? legendURLTags[0].textContent : ''

        let iconSize   = `&width=${ICON_SIZE.x}&height=${ICON_SIZE.y}`
        let thumbSize  = `&width=${THUMB_SIZE.x}&height=${THUMB_SIZE.y}`
        let iconURL    = `${ENDPOINT}?service=WMS&version=1.1.0&request=GetMap&bbox=${layer.bbox}${iconSize}&ssrs=${PROJECTION}&format=image%2Fpng&layers=${layer.layerName}&singleTile=true&styles=${styleName}`
        let thumbURL   =  iconURL.replace(iconSize, thumbSize)
        let iconExt    = `_${ICON_SIZE.x}_${ICON_SIZE.y}.png`
        let thumbExt   = `_${THUMB_SIZE.x}_${THUMB_SIZE.y}.png`
        let iconURL_2  =  ICON_THUMB_URL + layer.layerName.replace(':','_') + '-' + styleName.replace(':','_') + iconExt
        let thumbURL_2 =  iconURL_2.replace(iconExt, thumbExt)
        let tooltip    = `<span style="width:${TOOLTIP_SIZE}px;"><img src="${thumbURL_2}" onError="this.onerror=null;this.src='${thumbURL}'" width="${THUMB_SIZE.y}" class="estilo-tooltip"/><strong>${layer.title}</strong><br>${styleTitle}</span>`

        let styleObj = {
            'id'          : i,
            'title'       : styleTitle,
            'name'        : styleName,
            'description' : styleAbstract,
            'icon'        : iconURL,       // icon generated by GeoServer dynamically
            'icon_2'      : iconURL_2,     // cached icon
            'thumb'       : thumbURL,      // thumb generated by GeoServer dynamically
            'thumb_2'     : thumbURL_2,    // cached thumb
            'tooltip'     : tooltip,
        }

        styles.push(styleObj)
    }

    return styles
}
