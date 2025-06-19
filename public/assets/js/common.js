'use strict';

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const userLang = getCookie('lang');
const loadLanguage = lang => $.getJSON(`../../../locales/${lang}.json`).catch(() => ({}));

const showSwal = (type, url, id) => {
  loadLanguage(userLang).then(langtext => {
    if (type === 'warning-message-logout') {
      Swal.fire({
        title: langtext.COMM_TITLE,
        text: langtext.LOGOUT_TEXT,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: langtext.CONFIRM_LOGOUT,
        cancelButtonText: langtext.CONFIRMBTN_CANCEL,
        reverseButtons: true,
        customClass: {confirmButton: 'btn btn-success',cancelButton: 'btn btn-danger me-2'},
        buttonsStyling: false
      }).then(result => {
        if (result.isConfirmed) {
          $.post(`${$baseurl + url}`).done(res => res.success ? setTimeout(() => (window.location.href = `${$baseurl}login`), 1000)
            : Swal.fire(lang.CANCEL_TEXT, lang.LOGOUT_ERROR_TEXT, 'error'));
        }
      });
    }
  });
};


