
const Gif = ({ gifSrc, gifSmallSrc, mp4Src, mp4SmallSrc, title, url }) => (
<a href={url} target="_blank" >
 <picture>
     <source type="video/mp4" media="(max-width: 599px)" srcSet={mp4SmallSrc} />
     <source type="video/mp4" media="(min-width: 600px)" srcSet={mp4Src} />
     <source type="image/gif" media="(max-width: 599px)" srcSet={gifSmallSrc} />
     <img src={gifSrc} alt={title} />
 </picture>
</a>   
)

export default Gif