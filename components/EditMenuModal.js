import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import Modal from 'react-native-modal';

const EditMenuModal = ({ visible, onClose, documentId, documentName, documentNote, createdAt, onDelete,onEdit }) => {

  const [newName, setNewName] = useState(documentName || "");
  const [newNote, setNewNote] = useState(documentNote || "");
  


  // อัปเดตชื่อใหม่เมื่อค่า documentName เปลี่ยน
  useEffect(() => {
    setNewName(documentName || "");
    setNewNote(documentNote || ""); 
  }, [documentName, documentNote]);
  



  const menuOptions = [
    { icon: "edit", label: "Edit", action: () => {
        onClose(); 
        setTimeout(onEdit, 300); // ดีเลย์เล็กน้อยเพื่อให้ Modal ปิดก่อน
      }},
    { icon: "trash-2", label: "Move to Trash", action: () => {
        onClose();
        setTimeout(() => documentId && onDelete(documentId), 300);
      }, color: "red" }
  ];
  

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={{ justifyContent: "flex-end", margin: 0 }}>
      <View style={styles.modalContainer}>
      <Text style={styles.title}>{String(documentName || "Unknown name")}</Text>
      <Text style={styles.subtitle}>{createdAt ? `Created on ${createdAt}` : "Unknown date"}</Text>
      <Text style={styles.noteTitle}>Note: {String(documentNote || "No note available")}</Text>

            {menuOptions.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                <Feather name={item.icon} size={20} color={item.color || "black"} />
                <Text style={[styles.menuText, item.color && { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
      </View>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "gray",
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
};

export default EditMenuModal;
