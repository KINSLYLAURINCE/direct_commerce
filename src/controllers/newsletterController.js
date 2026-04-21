const Newsletter = require('../models/Newsletter');
const { sendNewProductNotification } = require('../utils/emailService');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }
    
    const subscriber = await Newsletter.create(email);
    res.status(201).json({ message: 'Inscription réussie', subscriber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }
    
    const subscriber = await Newsletter.unsubscribe(email);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Email non trouvé' });
    }
    
    res.json({ message: 'Désinscription réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.findAll();
    res.json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const { email } = req.params;
    
    const subscriber = await Newsletter.delete(email);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Email non trouvé' });
    }
    
    res.json({ message: 'Abonné supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber
}; 