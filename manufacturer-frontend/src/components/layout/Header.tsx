import './Header.css'

function Header() {
  return (
    <header className="page-header">
      <div className="admin-profile">
        <span className="avatar" aria-hidden="true">
          AM
        </span>
        <span className="profile-copy">
          <strong>Ayesha M.</strong>
          <span>Manufacturing Admin</span>
        </span>
      </div>
    </header>
  )
}

export default Header
