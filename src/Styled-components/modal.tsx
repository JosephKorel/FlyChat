import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import { MdGroupAdd } from "react-icons/md";
import NewGroup from "../Components/new-group";

function GroupModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        aria-label="Novo grupo"
        icon={<MdGroupAdd size={25} color="white" />}
        className="sticky"
        rounded="full"
        bg="#2ABCB8"
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Grupo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <NewGroup />
          </ModalBody>
          <ModalFooter>
            {/*  <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button> */}
            <Button variant="ghost" onClick={onClose} bg="gray.200">
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default GroupModal;
