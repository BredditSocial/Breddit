import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './post.module.css'
import Firebase from '../../firebase/Firebase'
import { Post as PostType, Comment as CommentType } from '../postCreator/PostCreator'
import CommentCreator from './commentCreator/CommentCreator'
import Comment from './comment/Comment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'

export default function Post() {
    const [post, setPost] = useState<PostType>(
        {
            id: undefined,
            title: undefined,
            text: undefined,
            community: undefined,
            user: undefined,
            comments: undefined
        }
    );
    const [imageURL, setImageURL] = useState<string>();
    const [renderPost, setRenderPost] = useState<boolean>(false);
    const [authorUsername, setAuthorUsername] = useState<string>()
    const [commentCreation, setCommentCreation] = useState<boolean>(false)
    const [comments, setComments] = useState<CommentType[] | undefined>();

    const params = useParams();
    const navigate = useNavigate();
    
    async function getPostData() {
        if (params.postID !== undefined) {
            let postFromDB = await Firebase.post.get(params.postID) as PostType;
            setPost(postFromDB);
        } 
    }

    async function getUsernamesData() {
        let imageURL = await Firebase.getImage(post);
        setImageURL(imageURL);
    }

    async function getUsername(){
        let fetchedUser: string;
        if(post.user !== undefined){
            fetchedUser = await Firebase.getUsername(post.user);
            setAuthorUsername(fetchedUser);
        }   
    }

    async function getCommentsData(){
        if (params.postID !== undefined) {
            let commentsFromDB = await Firebase.getComments(params.postID) as CommentType[];
            console.log(commentsFromDB)
            setComments(commentsFromDB);
        } 
    }

    useEffect(() => {
        getPostData();
        getCommentsData();
    }, [])
    

    useEffect(() => {
        if (post.id !== undefined) {
            getUsernamesData();
            getUsername();
        }
    }, [post])
    
    useEffect(() => {
        setRenderPost(true);
      }, [imageURL])
    
  return (
      <div className={styles.post}>
          <div className={styles.postInfo}>
            <div>b/{post.community}</div>
            {Firebase.auth.currentUser?.uid === post.user ?
            <button className={styles.editButton} onClick={()=>{
                navigate(`edit`);
            }}>Edit</button>
            :
            null
        }
            
          </div>
          <div className={styles.username}>{authorUsername}</div>
        <div className={styles.title}>{post.title}</div>
          <div className={styles.text}>{post.text}</div>
          <>
            {renderPost ? (() => {
                if(imageURL !== "noImage")
                    return (<img src={imageURL} className={styles.image}></img>)
                else {
                    return null
                }
              })()
              :
              null
          }
          </>
          <>
            {Firebase.auth.currentUser ?
                <button className={styles.addCommentButton} onClick={() => {
                setCommentCreation(true);
                }}>Add a comment</button> : null}
            {commentCreation ? <CommentCreator setCommentCreation={setCommentCreation} post={post}/> : null}
            {comments ? comments.map((comment)=>{
                return <Comment comment={comment}/>
            }) : null}
          </>
          <div className={styles.likesInterface}>
            {Firebase.auth.currentUser ? 
                <button
                onClick={() => {
                    if (post.id !== undefined && post.likes !== undefined && Firebase.auth.currentUser) {
                        let newLikes = post.likes + 1;
                        setPost({ ...post, likes: newLikes });
                        Firebase.likes.addLike(post.id, Firebase.auth.currentUser?.uid);
                    }
                }}
                className={styles.arrow}><FontAwesomeIcon icon={faArrowUp} /></button> 
            : null}
            <div className={styles.likes}>{post.likes}</div>
            {Firebase.auth.currentUser ? 
                <button
                onClick={() => {
                    if (post.id !== undefined && post.likes !== undefined && Firebase.auth.currentUser) {
                        let newLikes = post.likes - 1;
                        setPost({ ...post, likes: newLikes });
                        Firebase.likes.subtractLike(post.id, Firebase.auth.currentUser?.uid);
                    }
                }}
                className={styles.arrow}><FontAwesomeIcon icon={faArrowDown} /></button> 
            : null}
        </div>
    </div>
  )
}
