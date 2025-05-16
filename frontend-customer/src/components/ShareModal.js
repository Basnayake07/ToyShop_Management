import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import { FacebookShareButton, WhatsappShareButton, FacebookIcon, WhatsappIcon } from 'react-share';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import EmailIcon from '@mui/icons-material/Email';

// Import styles
import '@/styles/ShareModal.css'; // Adjust the path as necessary

const ShareModal = ({ open, onClose, shareUrl, title }) => {
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess('Link copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 3000);
      })
      .catch(() => {
        setCopySuccess('Failed to copy the link.');
        setTimeout(() => setCopySuccess(''), 3000);
      });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      className="share-modal-dialog"
      PaperProps={{
        className: "share-modal-paper"
      }}
    >
      <div className="share-modal-header">
        <DialogTitle className="share-modal-title">
          Share this product
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className="share-modal-close-btn"
        >
          <CloseIcon />
        </IconButton>
      </div>
      
      <DialogContent className="share-modal-content">
        <p className="share-modal-subtitle">Share this amazing product with your friends and family!</p>
        
        <div className="share-button-container">
          <div className="share-button-wrapper">
            <FacebookShareButton url={shareUrl} quote={title} className="share-button">
              <FacebookIcon size={50} round />
              <span className="share-label">Facebook</span>
            </FacebookShareButton>
          </div>
          
          <div className="share-button-wrapper">
            <WhatsappShareButton url={shareUrl} title={title} className="share-button">
              <WhatsappIcon size={50} round />
              <span className="share-label">WhatsApp</span>
            </WhatsappShareButton>
          </div>
          
          <div className="share-button-wrapper">
            <div className="custom-share-button" onClick={handleCopyLink}>
              <div className="custom-icon-wrapper link-icon">
                <LinkIcon />
              </div>
              <span className="share-label">Copy Link</span>
            </div>
          </div>
        </div>
        
        {copySuccess && (
          <div className="copy-success-message">
            {copySuccess}
          </div>
        )}
        
        <div className="share-url-container">
          <input 
            type="text"
            value={shareUrl}
            readOnly
            className="share-url-input"
          />
          <button className="copy-url-button" onClick={handleCopyLink}>
            Copy
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;