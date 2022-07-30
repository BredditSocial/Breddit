import { useState, useEffect } from 'react'
import styles from './styles.module.css'
import { Link } from 'react-router-dom'
import Firebase from '../../firebase/Firebase';
import { Post } from '../postCreator/PostCreator';

export default function Board() {
  const [posts, setPosts] = useState<Post[]>();
  const [images, setImages] = useState<{ postID: undefined | string, url: string }[]>()
  const [renderPosts, setRenderPosts] = useState<boolean>(false)

  useEffect(() => {
    async function fetchPostsFromDB() {
      const postsFromDB = await Firebase.getPosts() as Array<Post>;
      setPosts(postsFromDB);
      let newImages: { postID: undefined | string, url: string }[] = [];
      async function getImageData () {
        await Promise.all(postsFromDB.map(async (post) => {
          const imageURL = await Firebase.getImage(post);
          newImages.push({
            postID: post.id,
            url: imageURL
          })
        }));
      }
      getImageData().then(() => {
        setImages(newImages)
      });
    }
    fetchPostsFromDB();
  }, [])

  useEffect(() => {
    setRenderPosts(true);
  }, [images])
  
  return (
    <div className={styles.board}>
      <div className={styles.main}>
        <div className={styles.createPost}>
          <div className={styles.profilePic}></div>
          <Link to="/post" className={styles.createPostButton}>Create post</Link>
        </div>
        <div className={styles.dashboard}>
          <div className={styles.filters}></div>
          <div className={styles.posts}>
            {renderPosts ? posts?.map((post) => {
              console.log(images);
              if (images != undefined) {
                let image = images.find(image => image.postID === post.id)
                if(image != undefined)
                return (<>
                  <Link to={`/posts/${post.id}`} className={styles.post}>
                    <div className={styles.postCommunity}>b/{post.community}</div>
                    <div className={styles.postTitle}>{post.title}</div>
                    {image.url !== "noImage" ? <img className={styles.postImage} src={image.url}></img> : null}
                  </Link>
                  </>)
              }
              else {
                return <div>Loading...</div>
              }
            })
              :
              null
            }
          </div>
        </div>
      </div>
      <div className={styles.addons}></div>
    </div>
  )
}
