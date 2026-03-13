import './Pagination.css';
import PropTypes from 'prop-types';

const Pagination = ({totalBlogs, blogsPerPage, setCurrentPage, currentPage}) => {
    let pages = [];

    for(let i = 1; i <= Math.ceil(totalBlogs / blogsPerPage); i++) {
        pages.push(i);
    }

  return (
    <div className='paginate'>
        {
            pages.map((page, index) => (
                <>
                    <p key={index} onClick={() => setCurrentPage(page)} className={page == currentPage ? 'active' : ''}> {page} </p>
                </>
            ))
        }
    </div>
  )
}

Pagination.propTypes = {
    totalBlogs: PropTypes.number.isRequired,
    blogsPerPage: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired
}

export default Pagination