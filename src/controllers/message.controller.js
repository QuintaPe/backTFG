const Unauthorized = require('../errors/Unauthorized');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const Camping = require('../models/message');
const messagesCtrl = {};

messagesCtrl.createConversation = async (req, res) => {
  // Crear una nueva conversación con los participantes dados
  const { type, id, camping } = req.body;
  const participants = [
    { type, id },
  ];

  if (camping) {
    const CampingObject = await Camping.findById(camping);
    if (!CampingObject.owner.equals(req.user._id)) {
      throw new Unauthorized();
    }
    participants.push({type: 'Camping', id: camping })
  } else {
    participants.push({ 
      type: 'User', 
      id: req.user.role !== 'admin' ? req.user._id : null 
    })
  }

  const prevConversation = await Conversation.findOne({
    $and: participants.map(p => ({ 'participants.id': p.id })),
  })

  if (prevConversation) {
    res.status(200).json(prevConversation);
    return;
  }

  const newConversation = new Conversation({ participants });
  await newConversation.save();

  res.status(201).json(newConversation);
};

messagesCtrl.getConversations = async (req, res, next) => {
  const { type, id } = req.query;

  if (type === 'Camping') {
    const CampingObject = await Camping.findById(id);
    if (!CampingObject.owner.equals(req.user._id)) {
      throw new Unauthorized();
    }
  }

  const filters = { 'participants.id': id };

  try {
    const conversations = await Conversation.search(
      null, filters, 0, 0, null, 'participants.id'
    );
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

messagesCtrl.getConversation = async (req, res, next) => {
  const { id } = req.params;

  const conversation = await Conversation.findById(id);

  if (!conversation.participants.find(p => p?.id?.equals(req.user._id)) && req.user.role !== 'admin') {
    throw new Unauthorized();
  }
  try {
    const messages = await Message.find({ conversation: id })
      .populate('sender') // Esto carga los detalles del remitente
      .sort('-createdAt'); // Ordena los mensajes por fecha de creación

    res.status(200).json({ conversation, messages });
  } catch (error) {
    next(error);
  }
};

messagesCtrl.sendMessage = async (req, res) => {
  const conversation = req.params.id;
  const sender = req.user._id;
  const message = req.body.message;

  // if (
  //   !conversation.participants.includes(sender) &&
  //   req.user.role !== 'admin'
  // ) {
  //   throw new Unauthorized();
  // }

  const newMessage = new Message({ conversation, sender, message });
  await newMessage.save();

  // Actualizar la conversación con la fecha del último mensaje y del último mensaje visto
  await Conversation.findByIdAndUpdate(
    conversation,
    {
      lastMessage: newMessage._id,
      $set: {
        [`lastMessageSeen.${sender}`]: new Date(),
      },
    },
    { new: true }
  );
  await newMessage.populate('sender')
  res.status(201).json(newMessage);
};

module.exports = messagesCtrl;
