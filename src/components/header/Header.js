import React,{ useEffect, useState} from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from './Header.module.scss'
import {FaShoppingCart, FaTimes, FaUserCircle} from 'react-icons/fa'
import {HiOutlineMenuAlt3} from 'react-icons/hi'
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './../../firebase/config';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { REMOVE_ACTIVE_USER, SET_ACTIVE_USER } from "../../redux/slice/authSlice";
import ShowOnLogin, { ShowOnLogout } from "../hiddenLink/hiddenLink";
import AdminOnlyRoute, { AdminOnlyLink } from "../adminOnlyRoute/AdminOnlyRoute";
import { CALCULATE_TOTAL_QUANTITY, selectCartTotalQuantity } from "../../redux/slice/cartSlice";

const logo = (
  <div className={styles.logo}>
    <Link to='/'>
      <h2>
        e<span>shop</span>.
      </h2>
    </Link>
  </div>
);



const activeLink = ({isActive}) => (
  isActive ? `${styles.active}` :``
);

const Header = () => {
  const [displayName,setdisplayName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [scrollPage, setScrollPage]=useState(false)
  const cartTotalQuantity = useSelector(selectCartTotalQuantity)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = (
    <span className={styles.cart}>
      <Link to='/cart'>
        Cart
        <FaShoppingCart size={20}/>
        <p>{cartTotalQuantity}</p>
      </Link>
    </span>
  );

  useEffect(()=>{
    CALCULATE_TOTAL_QUANTITY()
  })

  const fixNavbar = () => {
    if(window.scrollY > 0){
      setScrollPage(true)
    }else{
      setScrollPage(false)
    }
  }
  window.addEventListener('scroll',fixNavbar)

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  }

  const hideMenu = () => {
    setShowMenu(false)
  }

  const logoutUser = () => {
      signOut(auth).then(() => {
      toast.success('Logout successfully!')
      navigate('/')
    }).catch((error) => {
      toast.error(error.message)
});
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user);
        if (user.displayName == null) {
          const u1 = user.email.substring(0,user.email.indexOf('@'));
          const uName = u1.charAt(0).toUpperCase() + u1.slice(1);
          setdisplayName(uName);
        } else {
          setdisplayName(user.displayName);
        }
        
        // const uid = user.uid;
        // console.log(user.displayName);

        dispatch(
          SET_ACTIVE_USER({
            email: user.email,
            userName: user.displayName ? user.displayName : displayName,
            userID: user.uid,
          })
        )
      } else {
        setdisplayName('');

        dispatch(
          REMOVE_ACTIVE_USER({

          })
        )
      }
    });
    
  },[dispatch,displayName])

  return (
    <>
    <header className={scrollPage? `${styles.fixed}` : null}>
      <div className={styles.header}>
        {logo}

        <nav className={showMenu ? `${styles['show-nav']}` :`${styles['hide-nav']}`}>
          
          <div 
            className={showMenu ? `${styles['nav-wrapper']} ${styles['show-nav-wrapper']}` : `${styles['nav-wrapper']}`}
            onClick={hideMenu}
            >
          </div>

            <ul onClick={hideMenu}>
              <li className={styles['logo-mobile']}>
                {logo}
                <FaTimes 
                size={22}
                color='#fff'
                onClick={hideMenu}/> 
              </li>
              <li>
                <AdminOnlyLink>
                  <Link to='/admin/home'>
                    <button className="--btn --btn-primary">
                      Admin
                    </button>
                  </Link>
                </AdminOnlyLink>
              </li>

              <li>
                <NavLink to='/' className={activeLink}>Home</NavLink>
              </li>
              <li>
                <NavLink to='/contact' className={activeLink}>Contact Us</NavLink>
              </li>
            </ul>
            <div 
              className={styles['header-right']}
              onClick={hideMenu}>
              <span className={styles.links}>
                <ShowOnLogout>
                  <NavLink className={activeLink} to='/login'>Login</NavLink>
                </ShowOnLogout>
                <ShowOnLogin>
                  <a href="#home">
                    <FaUserCircle size={16} />
                    Hi,   {displayName}
                  </a>
                </ShowOnLogin>
                <ShowOnLogout>
                  <NavLink className={activeLink} to='/register'>Register</NavLink>
                </ShowOnLogout>
                <ShowOnLogin>
                <NavLink className={activeLink} to='/order-history'>My Orders</NavLink>
                </ShowOnLogin>
                <ShowOnLogin>
                  <NavLink onClick={logoutUser} to='/' >Log out</NavLink>
                </ShowOnLogin>
              </span>
              {cart}
            </div>
        </nav>

        <div className={styles['menu-icon']}>
          {cart}
          <HiOutlineMenuAlt3 
            size={28}
            onClick={toggleMenu}
          />
        </div>

      </div>
    </header>
    </>
  );
};

export default Header;
