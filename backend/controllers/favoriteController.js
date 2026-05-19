const { favoriteService } = require('../container');

exports.listMine = async (req, res) => {
  try {
    const data = await favoriteService.list(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.message.includes('require PostgreSQL') ? 503 : 400).json({ error: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const providerId = req.body.providerId ?? req.body.provider_id;
    const result       = await favoriteService.add(req.user.id, providerId);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.message.includes('require PostgreSQL') ? 503 : 400).json({ error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    await favoriteService.remove(req.user.id, Number(req.params.providerId));
    res.json({ message: 'Favorite removed.' });
  } catch (err) {
    res.status(err.message.includes('require PostgreSQL') ? 503 : 400).json({ error: err.message });
  }
};
