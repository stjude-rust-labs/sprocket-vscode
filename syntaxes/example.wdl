#@ except: CommentWhitespace, DeprecatedObject, DescriptionMissing
#@ except: InputSorting, MatchingParameterMeta, NonmatchingOutput

## # Hello
## ## World
##
## This is some **bold** and `code` text.
##

version 1.2

#@ except: MissingMetas
struct AStruct {
   String? member
}

# (These should not be markdown highlighted, as they are single number sign comments).
#
# **Here** are some more
# _single_ pound lines.
#
# > And a quote

task a_task {
   meta
   # Here is a comment between `meta` and the parenthesis.
   {
      # Here is a comment within `meta`.
      an_escaped_string: "bar \\ \n \t \' \" \~ \$ \000 \xFF \uFFFF \UFFFFFFFF"
      a_string_with_placeholders: "${foo} ~{bar}"
      a_multiline_string: <<<
         ${some_placeholder}
         this
         spans
         multiple
         lines
      >>>
      a_true: true
      a_false: false
      an_integer: 42
      a_float: -0.0e123
      an_array: [true, -42, "hello, world"]
      an_object: {
         subkey_one: "a",
         subkey_two: 73,
         subkey_three: true,
         subkey_four: false,
      }
      an_undefined_value: null
      # The '2' at the end of this identifier shouldn't be highlighted as a numeric.
      a_name_with_foo2: false
   }

   parameter_meta
   # Here is a comment between `parameter_meta` and the parenthesis.
   {
      # Here is a comment within `parameter_meta`.
      an_escaped_string: "bar \\ \n \t \' \" \~ \$ \000 \xFF \uFFFF \UFFFFFFFF"
      a_true: true
      a_false: false
      an_integer: 42
      a_float: -0.0e123
      an_array: [true, -42, "hello, world"]
      an_object: {
         subkey_one: "a",
         subkey_two: 73,
         subkey_three: true,
         subkey_four: false,
      }
      an_undefined_value: null
   }

   input
   # Here is a comment before the input.
   {
      Object? an_object
      String? a_string
      Boolean? a_boolean
      Int? an_integer
      Float? a_float
      String world = "world"
      AStruct? a_struct # This should not be higlighted, as it's not known within
                        # the TextMate language that it's a custom struct.
      Boolean in
   }

   command <<<
      echo "Hello, ~{world}"
   >>>

   output
   # Here is a comment before the output.
   {
      Object some_other_object = object {
         foo: "String"
      }
      String some_other_string = "foo bar baz"
      Boolean some_other_boolean = true
      Int some_other_integer = 42
      Float some_other_float = 0e3
      # This should not be higlighted, as it's not known within
      # the TextMate language that it's a custom struct.
      AStruct some_other_struct = AStruct {}
   }

   requirements
   # This is a comment before the requirements.
   {
      container: "ubuntu:latest"
   }

   hints
   # This is a comment before the hints.
   {
      max_cpu: 1
   }
}

task say_task {
   input {
      String greeting = "Hello"
      String name
   }

   command <<<
       echo "~{greeting}, ~{name}"
   >>>
}

workflow hello {
   meta
   # Here is a comment between `meta` and the parenthesis.
   {
      # Here is a comment within `meta`.
      an_escaped_string: "bar \\ \n \t \' \" \~ \$ \000 \xFF \uFFFF \UFFFFFFFF"
      a_true: true
      a_false: false
      an_integer: 42
      a_float: -0.0e123
      an_array: [true, -42, "hello, world"]
      an_object: {
         subkey_one: "a",
         subkey_two: 73,
         subkey_three: true,
         subkey_four: false,
      }
      an_undefined_value: null
   }

   parameter_meta
   # Here is a comment between `parameter_meta` and the parenthesis.
   {
      # Here is a comment within `parameter_meta`.
      an_escaped_string: "bar \\ \n \t \' \" \~ \$ \000 \xFF \uFFFF \UFFFFFFFF"
      a_true: true
      a_false: false
      an_integer: 42
      a_float: -0.0e123
      an_array: [true, -42, "hello, world"]
      an_object: {
         subkey_one: "a",
         subkey_two: 73,
         subkey_three: true,
         subkey_four: false,
      }
      an_undefined_value: null
   }

   input {
      Object an_object
      String a_string
      Boolean a_boolean
      Int an_integer
      Float a_float
      AStruct a_struct # This should not be higlighted, as it's not known within
                       # the TextMate language that it's a custom struct.
      Array[String] name_array = ["foo", "bar", "baz"]
      Boolean some_condition_task = false
   }

   call a_task as something {}

   scatter (name in name_array) {
      call say_task { name }
   }

   if (some_condition_task) {
      call a_task as task_two {}
   }

   output
   # Here is a comment before the output.
   {
      Object some_other_object = object {}
      String some_other_string = "foo bar baz"
      Boolean some_other_boolean = true
      Int some_other_integer = 42
      Float some_other_float = 0e3
      # This should not be higlighted, as it's not known within
      # the TextMate language that it's a custom struct.
      AStruct some_other_struct = AStruct {}
   }
}
