import { Box, Button, Link as ChakraLink, Container, Flex, FormControl, FormLabel, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/api";
import { IconCircle } from "../../components/IconCircle";
import { EMAIL_PATTERN } from "../../constants/email";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};
const defaultValues = { email: "", password: "", confirmPassword: "" };

const Register = () => {
  const navigate = useNavigate();
  const { handleSubmit, register, formState: { isSubmitting, errors, isValid }, reset, watch } = useForm<FormData>({ defaultValues });

  const { mutate: createAccount, isPending, isError, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      reset();
      navigate("/", {
        replace: true,
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    createAccount(data);
  };

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Container mx="auto" maxW="md" px={10} textAlign="center" role="main">
        <Heading fontSize="4xl" mb={20} color="whiteAlpha.900">
          Create an account
        </Heading>
        {/* MAIN AUTHENTICATION BOX */}
        <Box
          role="region"
          boxShadow={"0px -6px 5px rgba(254, 254, 254, 0.877)"}
          rounded="lg"
          bg={"gray.700"}
          p={8}
          position="relative"
        >
          {/* Rounded Circle Icon */}
          <IconCircle />

          {/* ERROR MESSAGE FOR API CALL */}
          <Box mb={3} color="red.400" minH={6} textAlign="center" role="alert">
            {isError && (error?.message || "An error occurred")}
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={1}>
              {/* EMAIL INPUT */}
              <FormControl id="email" isInvalid={Boolean(errors.email)}>
                <FormLabel >Email address</FormLabel>
                <Input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_PATTERN,
                      message: "Invalid email format",
                    },
                  })}
                  autoFocus
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: "gray.200" }}
                />
                {/* Error message for email field */}
                <Text fontSize="xs" color="red.300" textAlign={"left"} minH={4} lineHeight={1.4} aria-live="polite">
                  {errors.email?.message && errors.email.message}
                </Text>
              </FormControl>
              {/* PASSWORD INPUT*/}
              <FormControl id="password" isInvalid={Boolean(errors.password)}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  borderColor="gray.600"
                  color="white"
                />
                {/* PASSWORD HINT */}
                <Text color="gray.400" fontSize="xs" textAlign="left">
                  - Must be at least 6 characters long.
                </Text>
                {/* ERROR MESSAGE FOR PASSWORD FIELD */}
                <Text fontSize="xs" color="red.300" textAlign={"left"} minH={4} lineHeight={1.4} aria-live="polite">
                  {errors.password?.message && errors.password.message}
                </Text>
              </FormControl>
              {/* CONFIRM PASSWORD INPUT */}
              <FormControl id="confirmPassword" isInvalid={Boolean(errors.confirmPassword)}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) => value === watch("password") || "Passwords do not match",
                  })}
                  borderColor="gray.600"
                  color="white"
                />
                {/* ERROR MESSAGE FOR CONFIRM PASSWORD FIELD */}
                <Text fontSize="xs" color="red.300" textAlign={"left"} minH={4} lineHeight={1.4} aria-live="polite">
                  {errors.confirmPassword?.message && errors.confirmPassword.message}
                </Text>
              </FormControl>
              {/* FORGOT PASSWORD LINK */}
              <ChakraLink
                as={Link}
                to="/password/forgot"
                fontSize="sm"
                _hover={{ textDecoration: "underline" }}
                color={"blue.200"} fontWeight={600}
              >
                Forgot password?
              </ChakraLink>
              {/* CTA BUTTON */}
              <Button
                my={2}
                isLoading={isPending || isSubmitting}
                isDisabled={isPending || isSubmitting}
                type="submit"
                size="md"
              >
                Create Account
              </Button>
              {/* ALREADY HAVE ACCOUNT TEXT AND LINK */}
              <Text align="center" fontSize="sm" color="gray.300">
                Already have an account?{" "}
                <ChakraLink as={Link} to="/login" _hover={{ textDecoration: "underline" }} color={"blue.200"} fontWeight={600}>
                  Sign in
                </ChakraLink>
              </Text>
            </Stack>
          </form>
        </Box>
      </Container>
    </Flex>
  );
};

export default Register;
